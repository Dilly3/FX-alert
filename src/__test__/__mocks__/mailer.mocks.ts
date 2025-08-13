
export function MockMailer() {
  return {
    sendFxRateEmail: jest.fn(),
    sendPinVerificationEmail: jest.fn(),
  };
}