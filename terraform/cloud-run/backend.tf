
terraform {
  backend "gcs" {
    bucket = "fx-alert-tfstate-bucket"
    prefix = "terraform/service/state"
  }
}