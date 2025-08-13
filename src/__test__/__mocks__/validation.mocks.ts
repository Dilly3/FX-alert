export function MockValidatorDB() {
  return {
    getCurrency: jest.fn().mockImplementation((currency) => {
      // Mock successful validation for USD and EUR
      if (currency === "USD") {
        return Promise.resolve("USD");
      }
      if (currency === "EUR") {
        return Promise.resolve("EUR");
      }
      return Promise.reject(new Error("Invalid currency"));
    }),
  };
}
