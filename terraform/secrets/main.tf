provider "google" {
project = "fs-alert-d4f21"
region = "us-west2"
}

resource "google_secret_manager_secret" "fx_alert_secrets" {
  project   = var.project_id
  secret_id = "fx_alert_secrets"

  replication {
    auto {}
  }

  labels = {
    environment = "prod"
    managed_by  = "terraform"
    app         = "fx_alert"
  }
}

resource "google_secret_manager_secret_version" "fx_alert_secrets" {
  secret      = google_secret_manager_secret.fx_alert_secrets.id
  secret_data = jsonencode(local.fx_alert_secrets)
}