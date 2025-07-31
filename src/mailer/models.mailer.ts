export interface LiveRatesResponse {
  success: boolean;
  base: string;
  timestamp: number;
  rates: Record<string, number>;
}

export interface PinVerificationEmailData {
    pin: string;
    email: string;
    expiryTime: string;
    baseUrl: string;
}
export interface EmailOptions {
  to: string;
  from: string;
  subject?: string;
  templatePath?: string;
}