#!/usr/bin/env bash

rm -rf .terraform
rm .terraform.lock.hcl

# Delete the state file
gsutil rm gs://fx-alert-tfstate-bucket/terraform/network/state/default.tfstate

terraform init