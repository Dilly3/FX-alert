resource "google_compute_network" "private_network" {
  provider = google-beta
  project = var.project_id
  name = "fx-alert-vpc-network"
}

resource "google_compute_global_address" "private_ip_address" {
  provider = google-beta
  project       = var.project_id
  name          = "fx-alert-vpc-ip"
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
  project       = var.project_id
  name          = "fx-alert-vpc-connector"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.private_network.name
  region        = var.region
  machine_type   = "e2-micro"
  min_instances  = 2
  max_instances  = 4
}

resource "google_compute_firewall" "allow_private_network" {
  project = var.project_id
  name    = "allow-private-network"
  network = google_compute_network.private_network.name
  
  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }
  
  source_ranges = ["10.25.0.0/16"]  # private IP range
}

resource "google_compute_firewall" "allow_connector" {
  project = var.project_id
  name    = "allow-vpc-connector"
  network = google_compute_network.private_network.name
  
  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }
  
  source_ranges = ["10.8.0.0/28"]  # VPC connector range
}
