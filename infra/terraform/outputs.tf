output "public_ip" {
  value = oci_core_instance.portfolio.public_ip
}

output "instance_id" {
  value = oci_core_instance.portfolio.id
}

output "ssh_nsg_id" {
  value = oci_core_network_security_group.ssh.id
}
