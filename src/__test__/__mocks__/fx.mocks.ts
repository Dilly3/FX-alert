export function MockFxAgent() {
  return {
    formatCurrency: jest.fn(),
    convertCurrency: jest.fn(),
    getSupportedCurrencies: jest.fn(),
    saveSupportedCurrencies: jest.fn(),
    verifyCurrency: jest.fn(),
    getLiveRates: jest.fn(),
  };
}
