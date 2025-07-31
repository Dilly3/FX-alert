
provider "google" {
project = "fs-alert-d4f21"
region = "us-west1"
}

# Individual secrets for each configuration value
resource "google_secret_manager_secret" "database_host" {
  secret_id = "database_host"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "database_host" {
  secret = google_secret_manager_secret.database_host.id
  secret_data = var.database_host
}

resource "google_secret_manager_secret" "database_id" {
  secret_id = "database_id"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "database_id" {
  secret = google_secret_manager_secret.database_id.id
  secret_data = var.database_id
}

resource "google_secret_manager_secret" "database_name" {
  secret_id = "database_name"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "database_name" {
  secret = google_secret_manager_secret.database_name.id
  secret_data = var.database_name
}

resource "google_secret_manager_secret" "database_password" {
  secret_id = "database_password"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "database_password" {
  secret = google_secret_manager_secret.database_password.id
  secret_data = var.database_password
}

resource "google_secret_manager_secret" "database_port" {
  secret_id = "database_port"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "database_port" {
  secret = google_secret_manager_secret.database_port.id
  secret_data = var.database_port
}

resource "google_secret_manager_secret" "database_user" {
  secret_id = "database_user"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "database_user" {
  secret = google_secret_manager_secret.database_user.id
  secret_data = var.database_user
}

resource "google_secret_manager_secret" "firebase_storage_bucket" {
  secret_id = "firebase_storage_bucket"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "firebase_storage_bucket" {
  secret = google_secret_manager_secret.firebase_storage_bucket.id
  secret_data = var.firebase_storage_bucket
}

resource "google_secret_manager_secret" "forex_api_key" {
  secret_id = "forex_api_key"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "forex_api_key" {
  secret = google_secret_manager_secret.forex_api_key.id
  secret_data = var.forex_api_key
}

resource "google_secret_manager_secret" "fx_alert_project_id" {
  secret_id = "fx_alert_project_id"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "fx_alert_project_id" {
  secret = google_secret_manager_secret.fx_alert_project_id.id
  secret_data = var.fx_alert_project_id
}

resource "google_secret_manager_secret" "sendgrid_api_key" {
  secret_id = "sendgrid_api_key"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "sendgrid_api_key" {
  secret = google_secret_manager_secret.sendgrid_api_key.id
  secret_data = var.sendgrid_api_key
}

resource "google_secret_manager_secret" "sendgrid_email_subject" {
  secret_id = "sendgrid_email_subject"
  labels = {
    label = "fx-alert-secrets"
  }

  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "sendgrid_email_subject" {
  secret = google_secret_manager_secret.sendgrid_email_subject.id
  secret_data = var.sendgrid_email_subject
}

resource "google_secret_manager_secret" "sendgrid_sender_email" {
  secret_id = "sendgrid_sender_email"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }
  
  deletion_protection = false
}

resource "google_secret_manager_secret_version" "sendgrid_sender_email" {
  secret = google_secret_manager_secret.sendgrid_sender_email.id
  secret_data = var.sendgrid_sender_email
}

resource "google_secret_manager_secret" "rate_limit_max" {
  secret_id = "rate_limit_max"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }

  deletion_protection = false
}

resource "google_secret_manager_secret_version" "rate_limit_max" {
  secret = google_secret_manager_secret.rate_limit_max.id
  secret_data = var.rate_limit_max
}

resource "google_secret_manager_secret" "rate_limit_window" {
  secret_id = "rate_limit_window"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }

  deletion_protection = false
}

resource "google_secret_manager_secret_version" "rate_limit_window" {
  secret = google_secret_manager_secret.rate_limit_window.id
  secret_data = var.rate_limit_window
}

resource "google_secret_manager_secret" "base_url" {
  secret_id = "base_url"
  labels = {
    label = "fx-alert-secrets"
  }
  
  replication {
    auto {}
  }

  deletion_protection = false
}

resource "google_secret_manager_secret_version" "base_url" {
  secret = google_secret_manager_secret.base_url.id
  secret_data = var.base_url
}