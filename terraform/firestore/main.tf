
resource "google_firestore_database" "fx-alert-db" {
  project                           = "fs-alert-d4f21"
  name                              = "fx-alert-db"
  location_id                       = "nam5"
  type                              = "FIRESTORE_NATIVE"
  concurrency_mode                  = "OPTIMISTIC"
  database_edition                  = "STANDARD"
  app_engine_integration_mode       = "DISABLED"
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"
  delete_protection_state           = "DELETE_PROTECTION_DISABLED"
  deletion_policy                   = "SOFT_DELETE"
}

resource "google_firebaserules_ruleset" "firestore" {
  project = "fs-alert-d4f21"
  source {
    files {
      content = file("firestore.rules")
      name    = "firestore.rules"
    }
  }
}

