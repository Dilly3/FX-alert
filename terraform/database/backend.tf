terraform {
  required_version = ">= 1.0"
  
  backend "gcs" {
    bucket = "fx-alert-tfstate-bucket"
    prefix = "terraform/state"
  }
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}