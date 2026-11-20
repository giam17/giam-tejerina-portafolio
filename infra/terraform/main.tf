locals {
  name = "giam-portafolio"
  tags = { Proyecto = local.name }
  cidr = "10.54.0.0/16"
}

data "oci_identity_availability_domains" "region" {
  compartment_id = var.tenancy_ocid
}

resource "oci_identity_compartment" "portfolio" {
  compartment_id = var.tenancy_ocid
  name           = local.name
  description    = "Proyecto de Sistemas III"
  freeform_tags  = local.tags
}

resource "oci_core_vcn" "portfolio" {
  compartment_id = oci_identity_compartment.portfolio.id
  display_name   = "${local.name}-vcn"
  cidr_blocks    = [local.cidr]
  dns_label      = "giamportfolio"
  freeform_tags  = local.tags
}

resource "oci_core_internet_gateway" "portfolio" {
  compartment_id = oci_identity_compartment.portfolio.id
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${local.name}-internet"
  enabled        = true
}

resource "oci_core_route_table" "public" {
  compartment_id = oci_identity_compartment.portfolio.id
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${local.name}-public"
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.portfolio.id
  }
}

resource "oci_core_route_table" "private" {
  compartment_id = oci_identity_compartment.portfolio.id
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${local.name}-private"
}

resource "oci_core_security_list" "nsg_only" {
  compartment_id = oci_identity_compartment.portfolio.id
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${local.name}-nsg-only"
}

resource "oci_core_subnet" "public" {
  compartment_id             = oci_identity_compartment.portfolio.id
  vcn_id                     = oci_core_vcn.portfolio.id
  display_name               = "${local.name}-public"
  dns_label                  = "public"
  cidr_block                 = "10.54.10.0/24"
  route_table_id             = oci_core_route_table.public.id
  security_list_ids          = [oci_core_security_list.nsg_only.id]
  prohibit_public_ip_on_vnic = false
}

resource "oci_core_subnet" "private" {
  compartment_id             = oci_identity_compartment.portfolio.id
  vcn_id                     = oci_core_vcn.portfolio.id
  display_name               = "${local.name}-private"
  dns_label                  = "private"
  cidr_block                 = "10.54.20.0/24"
  route_table_id             = oci_core_route_table.private.id
  security_list_ids          = [oci_core_security_list.nsg_only.id]
  prohibit_public_ip_on_vnic = true
}

resource "oci_core_network_security_group" "web" {
  compartment_id = oci_identity_compartment.portfolio.id
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${local.name}-web"
}

resource "oci_core_network_security_group_security_rule" "web" {
  for_each                  = toset(["80", "443"])
  network_security_group_id = oci_core_network_security_group.web.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  description               = "Puerto web ${each.key}"
  tcp_options {
    destination_port_range {
      min = tonumber(each.key)
      max = tonumber(each.key)
    }
  }
}

resource "oci_core_network_security_group_security_rule" "egress" {
  network_security_group_id = oci_core_network_security_group.web.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"
}

resource "oci_core_network_security_group" "ssh" {
  compartment_id = oci_identity_compartment.portfolio.id
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${local.name}-github-ssh"
}

resource "oci_core_instance" "portfolio" {
  compartment_id      = oci_identity_compartment.portfolio.id
  availability_domain = data.oci_identity_availability_domains.region.availability_domains[0].name
  display_name        = "${local.name}-ubuntu"
  shape               = "VM.Standard.E2.1.Micro"
  freeform_tags       = local.tags

  source_details {
    source_type             = "image"
    source_id               = var.ubuntu_2404_image_ocid
    boot_volume_size_in_gbs = 50
    boot_volume_vpus_per_gb = 10
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = true
    hostname_label   = "portafolio"
    nsg_ids          = [oci_core_network_security_group.web.id, oci_core_network_security_group.ssh.id]
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file("${path.module}/cloud-init.yaml"))
  }
}
