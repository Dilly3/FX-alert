
# Outputs for connection details
output "instance_connection_name" {
  value = google_sql_database_instance.instance.connection_name
}

output "private_ip_address" {
  value = google_sql_database_instance.instance.private_ip_address
}

output "database_name" {
  value = google_sql_database.database.name
}

output "database_user" {
  value = google_sql_user.users.name
}

output "vpc_connector" {
  value = google_vpc_access_connector.connector.name
}