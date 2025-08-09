import { LiveRatesResponse, PinVerificationEmailData } from "./models.mailer";

export interface Mailer {
  sendFxRateEmail(data: LiveRatesResponse, to: string): Promise<void>;
  sendPinVerificationEmail(
    data: PinVerificationEmailData,
    to: string
  ): Promise<void>;
}
