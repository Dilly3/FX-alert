type UserCreateDto = {
    email: string
    firstName: string 
    lastName: string
    fromCurrency: string
    toCurrency: string
    preferences: string
}

interface CurrencyResponse {
  success: boolean;
  symbols: Record<string, string>;
}

export {UserCreateDto, CurrencyResponse}

