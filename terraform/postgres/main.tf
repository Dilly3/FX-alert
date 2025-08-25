
data "google_compute_network" "private_network" {
  project = var.project_id
  name    = "fx-alert-vpc-network"
}

resource "google_sql_database_instance" "instance" {
  project = var.project_id
  name             = "fx-alert-db"
  region           = var.region
  database_version = "POSTGRES_15"
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
    availability_type = "ZONAL"
    disk_type        = "PD_SSD"
    disk_size        = 10
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = data.google_compute_network.private_network.self_link
      enable_private_path_for_google_cloud_services = true
    }
  }
}

# Create a database
resource "google_sql_database" "database" {
  name     = "fx_alert_db"
  instance = google_sql_database_instance.instance.name
  project  = var.project_id
}

