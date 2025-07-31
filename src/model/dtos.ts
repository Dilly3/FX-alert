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
interface LiveRatesRequest {
  base: string;
  currencies: string[];
  email?: string;
}
interface LiveRatesResponse {
  success: boolean;
  base: string;
  timestamp: number;
  rates: Record<string, number>;
}
interface UserDto {
  email: string;
  baseCurrency: string;
  targetCurrency: string;
  pinExpiryTime: string;
  isVerified: boolean;
}
interface CreateUserResponse {
  success: boolean;
  message: string;
  user: UserDto;
}

interface VerifyUserDto {
  email: string;
  pin: string;
}

type CreateUserDto = {
    email: string
    baseCurrency: string
    targetCurrency: string
}




export {CurrencyResponse, ConvertCurrencyResponse, LiveRatesResponse, VerifyUserDto, CreateUserDto, LiveRatesRequest, UserDto, CreateUserResponse}

