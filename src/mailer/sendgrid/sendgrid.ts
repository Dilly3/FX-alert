// Load environment variables from .env file
require('dotenv').config()
import { EmailData,EmailOptions } from "../models.mailer"

const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const path = require('path')
const fs = require('fs')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


function generateTextContent(data: EmailData): string {
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

export async function sendEmail(data: EmailData, options: EmailOptions): Promise<void> {
  try {
    // Default template path
    const templatePath = options.templatePath || path.join(__dirname, '..', 'templates', 'email-template.ejs')
    
    // Read and render the EJS template
    const templateContent = fs.readFileSync(templatePath, 'utf8')
    const htmlContent = ejs.render(templateContent, { data })

    const msg = {
      to: options.to,
      from: options.from,
      subject: options.subject || 'Exchange Rate Update',
      text: generateTextContent(data),
      html: htmlContent
    }

    await sgMail.send(msg)
    console.log('Email sent successfully')
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send email:', error.message)
    }
    throw error
  }
}

export async function sendExchangeRateEmail(data: EmailData, to : string): Promise<void> {
// Create email options
const emailOptions: EmailOptions = {
  to: to,
  from: process.env.SENDGRID_SENDER_EMAIL || "",
  subject: process.env.EMAIL_SUBJECT || 'Today Rate'
}
  await sendEmail(data, emailOptions)
} 

export async function sendMail(data: EmailData, to : string) {
  try {
    // Send rates
    console.log('Mailing rates ...')
    await sendExchangeRateEmail(data,to)
    console.log('Multiple rates email sent successfully!')
  } catch (error) {
if (error instanceof Error) {
console.error('Failed to send email:', error.message)
}
    
  }
}