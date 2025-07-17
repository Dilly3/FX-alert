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
exports.sendEmail = sendEmail;
exports.sendExchangeRateEmail = sendExchangeRateEmail;
exports.sendMail = sendMail;
// Load environment variables from .env file
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
function generateTextContent(data) {
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
    }
    else {
        return `Today's Exchange Rate\n\nBase Currency: ${data.baseCurrency}\nTarget Currency: ${data.currency}\nRate: ${data.rate.toLocaleString()}\n\nLast Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
}
function sendEmail(data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Default template path
            const templatePath = options.templatePath || path.join(__dirname, '..', 'templates', 'email-template.ejs');
            // Read and render the EJS template
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const htmlContent = ejs.render(templateContent, { data });
            const msg = {
                to: options.to,
                from: options.from,
                subject: options.subject || 'Exchange Rate Update',
                text: generateTextContent(data),
                html: htmlContent
            };
            yield sgMail.send(msg);
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
function sendExchangeRateEmail(data, to) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create email options
        const emailOptions = {
            to: to,
            from: process.env.SENDGRID_SENDER_EMAIL || "",
            subject: process.env.EMAIL_SUBJECT || 'Today Rate'
        };
        yield sendEmail(data, emailOptions);
    });
}
function sendMail(data, to) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Send rates
            console.log('Mailing rates ...');
            yield sendExchangeRateEmail(data, to);
            console.log('Multiple rates email sent successfully!');
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Failed to send email:', error.message);
            }
        }
    });
}
