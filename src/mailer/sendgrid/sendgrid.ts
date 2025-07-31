// Load environment variables from .env file
require('dotenv').config()
import { config, default_config } from "../../secrets/secrets_manager"
import { EmailOptions, LiveRatesResponse, PinVerificationEmailData } from "../models.mailer"


export class SendGrid {
private sgMail: any
private ejs: any
private path: any
private fs: any
  constructor(private secrets: config) {
    this.sgMail = require('@sendgrid/mail')
    this.ejs = require('ejs')
    this.path = require('path')
    this.fs = require('fs')
    this.sgMail.setApiKey(this.secrets!.sendgrid_api_key)
   
  }

public async sendFxRateEmail(data: LiveRatesResponse, to : string): Promise<void> {
// Create email options
const emailOptions: EmailOptions = {
  to: to,
  from: default_config!.sendgrid_sender_email || "",
  subject: "Today's Exchange Rates"
}
  await this.sendRatesEmail(data, emailOptions)
}

public async sendPinVerificationEmail(data: PinVerificationEmailData, to : string): Promise<void> {
  // Create email options
  const emailOptions: EmailOptions = {
    to: to,
    from: default_config!.sendgrid_sender_email || "",
    subject: "Pin Verification"
  }
  await this.sendPinEmail(data, emailOptions)
}

private async sendRatesEmail(data: LiveRatesResponse, options: EmailOptions): Promise<void> {
  try {
    // Default template path
    const templatePath = options.templatePath || this.path.join(__dirname, '..', 'templates', 'email-template.ejs')
    
    // Read and render the EJS template
    const templateContent = this.fs.readFileSync(templatePath, 'utf8')
    const htmlContent = this.ejs.render(templateContent, { data })

    const msg = {
      to: options.to,
      from: options.from,
      subject: options.subject || 'Exchange Rate Update',
      text: this.generateRatesTextContent(data),
      html: htmlContent
    }

    await this.sgMail.send(msg)
    console.log('Email sent successfully')
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send email:', error.message)
    }
    throw error
  }
}

private async sendPinEmail(data: PinVerificationEmailData, options: EmailOptions): Promise<void> {  
  try {
      const templatePath = options.templatePath || this.path.join(__dirname, '..', 'templates', 'verification-template.ejs')
    const templateContent = this.fs.readFileSync(templatePath, 'utf8')
    const htmlContent = this.ejs.render(templateContent, data)

    const msg = {
      to: options.to,
      from: options.from,
      subject: options.subject || 'Pin Verification',
      text: this.generatePinVerificationTextContent(data),
      html: htmlContent
    }

    await this.sgMail.send(msg)  
    console.log('Email sent successfully')
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send email:', error.message)
    }
    throw error
  }
}

private generatePinVerificationTextContent(data: PinVerificationEmailData): string {
  return `Your PIN is ${data.pin}. It will expire at ${data.expiryTime}.

  Please click the link below to verify your email:

  https://fx-alert-770622112844.us-west1.run.app/v1/user/verify?pin=${data.pin}

  If you did not request this verification, please ignore this email.
  `;
}


private generateRatesTextContent(data: LiveRatesResponse): string {
  return `Today's Exchange Rate\n\nBase Currency: ${data.base}\nTarget Currency: ${data.rates}\nRate: ${data.rates.toLocaleString()}\n\nLast Updated: ${new Date(data.timestamp).toLocaleString()}`;
}
 
}

