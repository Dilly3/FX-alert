
resource "google_artifact_registry_repository" "fx_alert_cloud_run_source_deploy" {
  location      = var.region
project = var.project_id
  repository_id = var.repository
  description   = "docker repository"
  format        = "DOCKER"
}

