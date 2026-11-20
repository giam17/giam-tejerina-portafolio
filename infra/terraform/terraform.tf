terraform {
  required_version = ">= 1.16.0, < 2.0.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 7.0.0, < 9.0.0"
    }
  }

  backend "oci" {}
}

provider "oci" {}
