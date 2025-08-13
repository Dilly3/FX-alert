export function GetMockCurrencyHandlerUserStore() {
  return {
    getUser: jest.fn(),
    getVerifiedUsers: jest.fn(),
    groupUsersByCurrency: jest.fn(),
  };
}

export function GetMockUserHandlerUserStore() {
  return {
    getUser: jest.fn(),
    saveUser: jest.fn(),
    validatePin: jest.fn(),
    generatePin: jest.fn(),
    verifyUser: jest.fn(),
  };
}
