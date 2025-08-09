import {
  ConvertCurrencyResponse,
  CurrencyResponse,
  LiveRatesResponse,
} from "../model/dtos";

export interface IFXAgent {
  formatCurrency(amount: number): string;
  getSupportedCurrencies(): Promise<CurrencyResponse>;
  saveSupportedCurrencies(): Promise<CurrencyResponse>;
  verifyCurrency(code: string): Promise<boolean>;
  convertCurrency(
    from: string,
    to: string,
    amount: number,
    date?: string
  ): Promise<ConvertCurrencyResponse>;
  getLiveRates(
    base: string,
    currencies: string[] | string
  ): Promise<LiveRatesResponse>;
}
