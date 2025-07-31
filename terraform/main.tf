terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
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

# Create API Gateway API
resource "google_api_gateway_api" "fx_alert_api" {
  provider = google
  api_id  = "fx-alert-api"
  
  display_name = "FX Alert API"
  description  = "API Gateway for FX Alert currency exchange service"
  
  depends_on = [google_project_service.required_apis]
}

# Create API Gateway API Config
resource "google_api_gateway_api_config" "fx_alert_api_config" {
  provider      = google
  api           = google_api_gateway_api.fx_alert_api.api_id
  api_config_id = "fx-alert-api-config-${formatdate("YYYYMMDD-hhmm", timestamp())}"
  
  openapi_documents {
    document {
      path = "api_config.yaml"
      contents = base64encode(file("${path.module}/../src/api-docs/api_config.yaml"))
    }
  }
  
  gateway_config {
    backend_config {
      google_service_account = google_service_account.api_gateway_sa.email
    }
  }
  
  depends_on = [google_api_gateway_api.fx_alert_api]
}

# Create API Gateway
resource "google_api_gateway_gateway" "fx_alert_gateway" {
  provider   = google
  region     = var.region
  api_config = google_api_gateway_api_config.fx_alert_api_config.id
  
  gateway_id = "fx-alert-gateway"
  
  display_name = "FX Alert API Gateway"
  description  = "API Gateway for FX Alert service"
  
  depends_on = [google_api_gateway_api_config.fx_alert_api_config]
}

# Create service account for API Gateway
resource "google_service_account" "api_gateway_sa" {
  account_id   = "fx-alert-api-gateway-sa"
  display_name = "FX Alert API Gateway Service Account"
  description  = "Service account for API Gateway to access backend services"
}

# Grant necessary permissions to the service account
resource "google_project_iam_member" "api_gateway_sa_roles" {
  for_each = toset([
    "roles/servicemanagement.serviceController",
    "roles/logging.logWriter"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.api_gateway_sa.email}"
}

# Output the gateway URL
output "gateway_url" {
  description = "The URL of the API Gateway"
  value       = google_api_gateway_gateway.fx_alert_gateway.default_hostname
}

# Output the API Gateway ID
output "gateway_id" {
  description = "The ID of the API Gateway"
  value       = google_api_gateway_gateway.fx_alert_gateway.gateway_id
}

# Output the API ID
output "api_id" {
  description = "The ID of the API"
  value       = google_api_gateway_api.fx_alert_api.api_id
} 