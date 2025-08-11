
output "registry_id" {
  description = "Artifact Registry ID"
  value       = google_artifact_registry_repository.fx_alert_cloud_run_source_deploy.id
}