// Load environment variables from .env file
require('dotenv').config()
import { config, default_config } from "../../secrets/secrets_manager"
import { EmailData,EmailOptions, PinVerificationEmailData } from "../models.mailer"


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

public async sendFxRateEmail(data: EmailData, to : string): Promise<void> {
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

private async sendRatesEmail(data: EmailData, options: EmailOptions): Promise<void> {
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
    const htmlContent = this.ejs.render(templateContent, { data })

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


private generateRatesTextContent(data: EmailData): string {
  if (Array.isArray(data)) {
    let text = `Today's Exchange Rates (${data.length} rates)\n\n`;
    data.forEach((item, index) => {
      text += `Rate #${index + 1}:\n`;
      text += `Base Currency: ${item.baseCurrency}\n`;
      text += `Target Currency: ${item.currency}\n`;
      text += `Rate: ${item.rate.toLocaleString()}\n\n`;
    });
    text += `Last Updated: ${new Date(data[0].timestamp).toLocaleString()}`;
    return text;
  } else {
    return `Today's Exchange Rate\n\nBase Currency: ${data.baseCurrency}\nTarget Currency: ${data.currency}\nRate: ${data.rate.toLocaleString()}\n\nLast Updated: ${new Date(data.timestamp).toLocaleString()}`;
  }
}
 
}
































 



