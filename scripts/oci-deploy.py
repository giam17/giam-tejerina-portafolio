import ipaddress
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.request import urlopen

import oci


PROJECT = "giam-portafolio"
TEMP = Path(os.environ["RUNNER_TEMP"])
RULE_FILE = TEMP / "portfolio-ssh-rule.json"
CONFIG = oci.config.from_file()
TENANCY = CONFIG["tenancy"]
IDENTITY = oci.identity.IdentityClient(CONFIG)
COMPUTE = oci.core.ComputeClient(CONFIG)
NETWORK = oci.core.VirtualNetworkClient(CONFIG)
STORAGE = oci.core.BlockstorageClient(CONFIG)
LIMITS = oci.limits.LimitsClient(CONFIG)


def list_all(function, *args, **kwargs):
    return oci.pagination.list_call_get_all_results(function, *args, **kwargs).data


def check_free_tier():
    home = next(region.region_name for region in IDENTITY.list_region_subscriptions(TENANCY).data if region.is_home_region)
    if CONFIG["region"] != home:
        raise SystemExit("La región de despliegue debe ser la región principal de OCI.")

    domains = IDENTITY.list_availability_domains(TENANCY).data
    active = {"PROVISIONING", "RUNNING", "STARTING", "STOPPING", "STOPPED"}
    compartments = [TENANCY] + [
        row.id for row in list_all(IDENTITY.list_compartments, TENANCY, compartment_id_in_subtree=True, access_level="ACCESSIBLE")
        if row.lifecycle_state == "ACTIVE"
    ]
    allocated = 0
    micros = []
    own_vm = False
    own_vcn = False
    for compartment in compartments:
        for instance in list_all(COMPUTE.list_instances, compartment_id=compartment):
            if instance.lifecycle_state in active and instance.shape == "VM.Standard.E2.1.Micro":
                micros.append(instance)
                own_vm |= (instance.freeform_tags or {}).get("Proyecto") == PROJECT
        for vcn in list_all(NETWORK.list_vcns, compartment_id=compartment):
            own_vcn |= vcn.lifecycle_state == "AVAILABLE" and (vcn.freeform_tags or {}).get("Proyecto") == PROJECT
        allocated += sum(v.size_in_gbs for v in list_all(STORAGE.list_volumes, compartment_id=compartment) if v.lifecycle_state != "TERMINATED")
        for domain in domains:
            allocated += sum(v.size_in_gbs for v in list_all(STORAGE.list_boot_volumes, compartment_id=compartment, availability_domain=domain.name) if v.lifecycle_state != "TERMINATED")

    total = allocated + (0 if own_vm else 50)
    if total > 200 or len(micros) + (0 if own_vm else 1) > 2:
        raise SystemExit("El despliegue superaría los límites gratuitos de Compute o volúmenes.")
    if not own_vcn:
        quota = LIMITS.get_resource_availability("vcn", "vcn-count", TENANCY).data.available
        if quota < 1:
            raise SystemExit("No hay cuota para crear una VCN nueva. Las redes existentes siguen en uso.")
    print(f"Cuota verificada en {home}: {total} GB totales previstos y forma Micro.")


def open_ssh():
    nsg = os.environ["PORTFOLIO_SSH_NSG"]
    with urlopen("https://checkip.amazonaws.com/", timeout=15) as response:
        address = ipaddress.IPv4Address(response.read(64).decode().strip())
    if not address.is_global:
        raise SystemExit("El runner no informó una IPv4 pública válida.")

    old_rules = list_all(NETWORK.list_network_security_group_security_rules, nsg)
    stale = [rule.id for rule in old_rules if (rule.description or "").startswith("portfolio-actions-")]
    if stale:
        NETWORK.remove_network_security_group_security_rules(
            nsg, oci.core.models.RemoveNetworkSecurityGroupSecurityRulesDetails(security_rule_ids=stale)
        )

    description = "portfolio-actions-" + os.environ["GITHUB_RUN_ID"]
    RULE_FILE.write_text(json.dumps({"nsg": nsg, "description": description}), encoding="utf-8")
    NETWORK.add_network_security_group_security_rules(
        nsg,
        oci.core.models.AddNetworkSecurityGroupSecurityRulesDetails(
            security_rules=[oci.core.models.AddSecurityRuleDetails(
                direction="INGRESS",
                protocol="6",
                source=f"{address}/32",
                source_type="CIDR_BLOCK",
                description=description,
                is_stateless=False,
                tcp_options=oci.core.models.TcpOptions(destination_port_range=oci.core.models.PortRange(min=22, max=22)),
            )]
        ),
    )
    print("Acceso SSH temporal habilitado para el runner.")


def close_ssh():
    if not RULE_FILE.exists():
        return
    data = json.loads(RULE_FILE.read_text(encoding="utf-8"))
    ids = [
        rule.id for rule in list_all(NETWORK.list_network_security_group_security_rules, data["nsg"])
        if rule.description == data["description"]
    ]
    if ids:
        NETWORK.remove_network_security_group_security_rules(
            data["nsg"], oci.core.models.RemoveNetworkSecurityGroupSecurityRulesDetails(security_rule_ids=ids)
        )
    print("Acceso SSH temporal retirado.")


def pin_host():
    instance = os.environ["PORTFOLIO_INSTANCE_ID"]
    ip = ipaddress.IPv4Address(os.environ["PORTFOLIO_PUBLIC_IP"])
    marker = rb"PORTFOLIO_SSH_HOST_KEY\s+(ssh-ed25519 [a-zA-Z0-9+/=]+)"
    for _ in range(24):
        history = COMPUTE.capture_console_history(
            oci.core.models.CaptureConsoleHistoryDetails(instance_id=instance, display_name="portfolio-actions-host-key")
        ).data
        try:
            oci.wait_until(COMPUTE, COMPUTE.get_console_history(history.id), "lifecycle_state", "SUCCEEDED", max_wait_seconds=45, max_interval_seconds=4)
            data = COMPUTE.get_console_history_content(history.id).data
            match = re.search(marker, data.content)
            if match:
                (TEMP / "portfolio_known_hosts").write_text(f"{ip} {match.group(1).decode()}\n", encoding="ascii")
                print("Clave SSH de Ubuntu verificada desde la consola autenticada de OCI.")
                return
        finally:
            COMPUTE.delete_console_history(history.id)
        time.sleep(8)
    raise SystemExit("No se encontró la clave SSH del portafolio en la consola de arranque.")


if __name__ == "__main__":
    commands = {"check": check_free_tier, "open-ssh": open_ssh, "close-ssh": close_ssh, "pin-host": pin_host}
    commands[sys.argv[1]]()
