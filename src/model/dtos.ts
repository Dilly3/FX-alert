type CreateUserDto = {
    email: string
    baseCurrency: string
    targetCurrency: string
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

interface VerifyUserDto {
  email: string;
  pin: string;
}





export {CreateUserDto, CurrencyResponse, ConvertCurrencyResponse, LiveRatesResponse, VerifyUserDto}

