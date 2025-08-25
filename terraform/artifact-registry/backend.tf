terraform {
  backend "gcs" {
    bucket = "fx-alert-tf-state-bucket"
    prefix = "terraform/artifact-registry/state"
  }
}