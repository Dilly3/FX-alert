resource "google_cloud_scheduler_job" "job" {
  name   = "fx-alert-job"
  project  = var.project_id
  region   = var.region
  description      = "fx-alert http target scheduler"
  schedule         = var.frequency
  time_zone   = var.time_zone
  attempt_deadline = "320s"

  retry_config {
    retry_count = var.retry
  }

  http_target {
    http_method = "POST"
    uri         = var.uri
    body        = base64encode("{\"operation\":\"scheduler\"}")
    headers = {
      "Content-Type" = "application/json"
    }
  }
}

