resource "google_compute_network" "private_network" {
  provider = google-beta
  project = "fs-alert-d4f21"
  name = "fs-alert-db-network"
}

resource "google_compute_global_address" "private_ip_address" {
  provider = google-beta
  project       = "fs-alert-d4f21"
  name          = "fs-alert-db-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  provider = google-beta
  network                 = google_compute_network.private_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

resource "google_vpc_access_connector" "connector" {
  project       = "fs-alert-d4f21"
  name          = "fs-alert-vpc-connector"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.private_network.name
  region        = "us-west1"
  machine_type   = "e2-micro"
  min_instances  = 2
  max_instances  = 4
}

resource "google_compute_firewall" "allow_private_network" {
  project = "fs-alert-d4f21"
  name    = "allow-private-network"
  network = google_compute_network.private_network.name
  
  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }
  
  source_ranges = ["10.25.0.0/16"]  # Your private IP range
}

resource "google_compute_firewall" "allow_connector" {
  project = "fs-alert-d4f21"
  name    = "allow-vpc-connector"
  network = google_compute_network.private_network.name
  
  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }
  
  source_ranges = ["10.8.0.0/28"]  # VPC connector range
}


resource "google_sql_database_instance" "instance" {
  project = "fs-alert-d4f21"
  name             = "fs-alert-db"
  region           = "us-west1"
  database_version = "POSTGRES_15"
  deletion_protection = false

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro"
    availability_type = "ZONAL"
    disk_type        = "PD_SSD"
    disk_size        = 10
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.private_network.self_link
      enable_private_path_for_google_cloud_services = true
    }
  }
}

# Create a database
resource "google_sql_database" "database" {
  name     = "fx_alert_db"
  instance = google_sql_database_instance.instance.name
  project  = "fs-alert-d4f21"
}

data "google_secret_manager_secret_version" "database_password" {
  secret  = "database_password"
  project = "fs-alert-d4f21"
}

# Create a user
resource "google_sql_user" "users" {
  name     = "ohdy"
  instance = google_sql_database_instance.instance.name
  password = data.google_secret_manager_secret_version.database_password.secret_data
  project  = "fs-alert-d4f21"
}
