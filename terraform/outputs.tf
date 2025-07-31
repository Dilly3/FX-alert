output "gateway_url" {
  description = "The URL of the API Gateway"
  value       = google_api_gateway_gateway.fx_alert_gateway.default_hostname
}

output "gateway_id" {
  description = "The ID of the API Gateway"
  value       = google_api_gateway_gateway.fx_alert_gateway.gateway_id
}

output "api_id" {
  description = "The ID of the API"
  value       = google_api_gateway_api.fx_alert_api.api_id
}

output "service_account_email" {
  description = "The email of the API Gateway service account"
  value       = google_service_account.api_gateway_sa.email
} 