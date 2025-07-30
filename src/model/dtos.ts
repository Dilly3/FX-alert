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

interface ConvertCurrencyResponse {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    quote: number;
    timestamp: number;
  };
  result: number;
}

interface LiveRatesResponse {
  success: boolean;
  base: string;
  timestamp: number;
  rates: Record<string, number>;
}





export {UserCreateDto, CurrencyResponse, ConvertCurrencyResponse, LiveRatesResponse}

