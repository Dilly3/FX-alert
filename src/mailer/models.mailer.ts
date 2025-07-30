

interface EmailDataItem {
  baseCurrency: string;
  currency: string;
  rate: number;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
  timestamp: string;
}

export type EmailData = EmailDataItem | EmailDataItem[];

export interface PinVerificationEmailData {
    pin: string;
    email: string;
    expiryTime: string;
}

export interface EmailOptions {
  to: string;
  from: string;
  subject?: string;
  templatePath?: string;
}