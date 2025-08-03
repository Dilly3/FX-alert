"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGrid = void 0;
// Load environment variables from .env file
require('dotenv').config();
const secrets_manager_1 = require("../../secrets/secrets_manager");
class SendGrid {
    constructor(secrets) {
        this.secrets = secrets;
        this.sgMail = require('@sendgrid/mail');
        this.ejs = require('ejs');
        this.path = require('path');
        this.fs = require('fs');
        this.sgMail.setApiKey(this.secrets.sendgrid_api_key);
    }
    sendFxRateEmail(data, to) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create email options
            const emailOptions = {
                to: to,
                from: secrets_manager_1.default_config.sendgrid_sender_email || "",
                subject: "Today's Exchange Rates"
            };
            yield this.sendRatesEmail(data, emailOptions);
        });
    }
    sendPinVerificationEmail(data, to) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create email options
            const emailOptions = {
                to: to,
                from: secrets_manager_1.default_config.sendgrid_sender_email || "",
                subject: "Pin Verification"
            };
            yield this.sendPinEmail(data, emailOptions);
        });
    }
    sendRatesEmail(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Default template path
                const templatePath = options.templatePath || this.path.join(__dirname, '..', 'templates', 'email-template.ejs');
                // Read and render the EJS template
                const templateContent = this.fs.readFileSync(templatePath, 'utf8');
                const htmlContent = this.ejs.render(templateContent, { data });
                const msg = {
                    to: options.to,
                    from: options.from,
                    subject: options.subject || 'Exchange Rate Update',
                    text: this.generateRatesTextContent(data),
                    html: htmlContent
                };
                yield this.sgMail.send(msg);
                console.log('Email sent successfully');
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Failed to send email:', error.message);
                }
                throw error;
            }
        });
    }
    sendPinEmail(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const templatePath = options.templatePath || this.path.join(__dirname, '..', 'templates', 'verification-template.ejs');
                const templateContent = this.fs.readFileSync(templatePath, 'utf8');
                const htmlContent = this.ejs.render(templateContent, data);
                const msg = {
                    to: options.to,
                    from: options.from,
                    subject: options.subject || 'Pin Verification',
                    text: this.generatePinVerificationTextContent(data),
                    html: htmlContent
                };
                yield this.sgMail.send(msg);
                console.log('Email sent successfully');
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Failed to send email:', error.message);
                }
                throw error;
            }
        });
    }
    generatePinVerificationTextContent(data) {
        return `Your PIN is ${data.pin}. It will expire at ${data.expiryTime}.

  Please click the link below to verify your email:

  https://fx-alert-770622112844.us-west1.run.app/v1/user/verify?pin=${data.pin}

  If you did not request this verification, please ignore this email.
  `;
    }
    generateRatesTextContent(data) {
        return `Today's Exchange Rate\n\nBase Currency: ${data.base}\nTarget Currency: ${data.rates}\nRate: ${data.rates.toLocaleString()}\n\nLast Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
}
exports.SendGrid = SendGrid;
