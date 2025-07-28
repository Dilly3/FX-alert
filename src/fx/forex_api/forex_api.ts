import { CurrencyResponse } from "../../model/dtos";
import { Currency } from "../../model/model";
import { CurrencyDataStore } from "../../datastore/datastore";
import axios from "axios";



export class ForexApi {
    constructor(private readonly apiKey: string, private readonly currencyDataStore: CurrencyDataStore) {}

    async getSupportedCurrencies(): Promise<CurrencyResponse> {
        // check database first
        const currencies = await this.currencyDataStore.getAllCurrencies();
        if (currencies.length > 0) {
            return {
                success: true,
                symbols: currencies.reduce((acc, currency) => {
                    acc[currency.code] = currency.name;
                    return acc;
                }, {} as Record<string, string>)
            };
        }
        // if not, get from api and save to database
        const params = new URLSearchParams();
        params.append('api_key', this.apiKey);

        const response = await axios.get<CurrencyResponse>(`https://api.forexrateapi.com/v1/symbols?${params.toString()}`);
        const { data } = response;
        await this.currencyDataStore.bulkUpsert(Object.entries(data.symbols).map(([key, value]) => ({
            id: key,
            code: key,
            name: value
        })));
        return data;
    }
async saveSupportedCurrencies(): Promise<CurrencyResponse> {
  const currencies = await this.getSupportedCurrencies();
  
  // Create all currency objects first
  const currencyPromises = Object.entries(currencies.symbols).map(
    async ([key, value]) => {
      const currency = new Currency();
      currency.code = key;
      currency.name = value;
      currency.id = key;
      return this.currencyDataStore.firstOrCreate(currency);
    }
  ); 
  // Execute all saves in parallel
  await Promise.all(currencyPromises);
  return currencies;
}

}