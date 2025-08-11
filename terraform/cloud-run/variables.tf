
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
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

variable "image" {
  description = "Docker image name"
  type        = string
}

variable "cpu" {
  description = "Number of CPU cores"
  type        = number
  default     = 1
}

variable "memory" {
  description = "Memory allocation in Memory units (e.g. 128Mi, 256Mi, etc.)"
  type        = string  
  default     = "256Mi"
}


variable "min_instances" {
  description = "Minimum number of instances"
  type        = string
  default     = 1
}

variable "max_instances" {       
  description = "Maximum number of instances"
  type        = string
  default     = 2
}
