terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 6.45.0" 
    }
  }

  required_version = ">= 1.3.0"
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "apigateway.googleapis.com",
    "servicemanagement.googleapis.com",
    "servicecontrol.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_api_gateway_api" "api_cfg" {
  provider = google-beta
  api_id = "fx-alert-api-${var.environment}-cfg"
  project = var.project_id
  
  depends_on = [google_project_service.required_apis]
}

resource "google_api_gateway_api_config" "api_cfg" {
  provider = google-beta
  api = google_api_gateway_api.api_cfg.api_id
  api_config_id = "fx-alert-api-config-${var.environment}-cfg"
  project = var.project_id

  openapi_documents {
    document {
      path = "api_config.yaml"
      contents = filebase64("${path.module}/../../src/api-docs/api_config.yaml")
    }
  }
  
  lifecycle {
    create_before_destroy = true
  }
  
  depends_on = [google_api_gateway_api.api_cfg]
}

resource "google_api_gateway_gateway" "api_gw" {
  provider = google-beta
  api_config = google_api_gateway_api_config.api_cfg.id
  gateway_id = "fx-alert-gateway-${var.environment}"
  project = var.project_id
  region = var.region
  
  depends_on = [google_api_gateway_api_config.api_cfg]
}