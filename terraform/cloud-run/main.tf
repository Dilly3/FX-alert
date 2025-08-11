data "google_vpc_access_connector" "fx_alert_connector" {
  name   = "fx-alert-vpc-connector"
  region = var.region
  project = var.project_id
}

resource "google_cloud_run_service" "fx_alert" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = data.google_vpc_access_connector.fx_alert_connector.id
        "run.googleapis.com/vpc-egress"           = "private-ranges-only"
        "autoscaling.knative.dev/minScale"        = var.min_instances
        "autoscaling.knative.dev/maxScale"        = var.max_instances
      }
    }
    spec {
      containers {
        image = var.image
        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }
        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
        env {
          name  = "ENV"
          value = var.environment
        }
      }
      container_concurrency = 80
      timeout_seconds       = 300
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "noauth" {
  service  = google_cloud_run_service.fx_alert.name
  location = google_cloud_run_service.fx_alert.location
  project  = google_cloud_run_service.fx_alert.project
  role     = "roles/run.invoker"
  member   = "allUsers"
}