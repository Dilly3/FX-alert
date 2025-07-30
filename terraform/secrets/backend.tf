terraform {
  required_version = ">= 1.0"
  
  backend "gcs" {
    bucket = "fx-alert-tfstate-bucket"
    prefix = "terraform/secrets/state"
  }
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.45.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.45.0"
    }
  }
}