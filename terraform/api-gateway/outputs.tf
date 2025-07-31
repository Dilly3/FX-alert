output "gateway_url" {
  description = "The URL of the API Gateway"
  value       = google_api_gateway_gateway.api_gw.default_hostname
}

output "gateway_id" {
  description = "The ID of the API Gateway"
  value       = google_api_gateway_gateway.api_gw.gateway_id
}

output "api_id" {
  description = "The ID of the API"
  value       = google_api_gateway_api.api_cfg.api_id
}
