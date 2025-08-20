locals {
  # Production secrets
  fx_alert_secrets = {
    database = {
      host     = var.database_host
      port     = var.database_port
      user     = var.database_user
      password = var.database_password
      name     = var.database_name
    }
    redis = {
      host      = var.redis_host
      password = var.redis_password
      username = var.redis_username
port      = var.redis_port
ttl_hr = var.redis_ttl_hr
    }

    sendgrid = {
    key = var.sendgrid_api_key
email_subject = var.sendgrid_email_subject
    sender_email = var.sendgrid_sender_email
    }

rate_limiting = {
    max = var.rate_limit_max
    window = var.rate_limit_window
  }

 misc = {
     firebase_storage_bucket=var.firebase_storage_bucket
forex_api_key=var.forex_api_key
fx_alert_project_id=var.fx_alert_project_id
base_url=var.base_url
    }
  }
}