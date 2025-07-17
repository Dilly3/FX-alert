

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

export interface EmailOptions {
  to: string;
  from: string;
  subject?: string;
  templatePath?: string;
}