#!/usr/bin/env bash

rm -rf .terraform
rm .terraform.lock.hcl

# Delete the state file
gsutil rm gs://fx-alert-tfstate-bucket/terraform/postgres/state/default.tfstate

terraform init