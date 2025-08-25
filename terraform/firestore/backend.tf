terraform {
  required_version = ">= 1.0"
  
  backend "gcs" {
    bucket = "fx-alert-tf-state-bucket"
    prefix = "terraform/firestore/state"
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