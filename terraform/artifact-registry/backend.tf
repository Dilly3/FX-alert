terraform {
  backend "gcs" {
    bucket = "fx-alert-tfstate-bucket"
    prefix = "terraform/artifact-registry/state"
  }
}