variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "fs-alert-d4f21"
}

variable "region" {
  description = "The GCP region for API Gateway"
  type        = string
  default     = "us-west1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}