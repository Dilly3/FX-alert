import {
  ConvertCurrencyRequest,
  ConvertCurrencyResponse,
  CurrencyResponse,
  LiveRatesRequest,
  LiveRatesResponse,
} from "../../model/dtos";
import { Currency } from "../../model/model";
import { CurrencyDataStore, ICache } from "../../datastore/datastore";
import axios from "axios";
import { LogError, LogInfo } from "../../logger/gcp_logger";
import { environment } from "../../secrets/secrets_manager";
import { IFXAgent } from "../fx_agent";

export class ForexApi implements IFXAgent {
  private formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  formatCurrency(amount: number): string {
    return this.formatter.format(amount);
  }

  constructor(
    private readonly apiKey: string,
    private readonly currencyDataStore: CurrencyDataStore,
    private readonly memCache: ICache
  ) {}

  async getSupportedCurrencies(): Promise<CurrencyResponse> {
    // check database first
    const currencies = await this.currencyDataStore.getAllCurrencies();
    if (currencies.length > 0) {
      return {
        success: true,
        symbols: currencies.reduce((acc, currency) => {
          acc[currency.code] = currency.name;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    // if not, get from api and save to database
    const params = new URLSearchParams();
    params.append("api_key", this.apiKey);
    try {
      const response = await axios.get<CurrencyResponse>(
        `https://api.forexrateapi.com/v1/symbols?${params.toString()}`
      );
      const { data } = response;
      await this.currencyDataStore.bulkUpsert(
        Object.entries(data.symbols).map(([key, value]) => ({
          id: key,
          code: key,
          name: value,
        }))
      );
      return data;
    } catch (error) {
      LogError("Error getting supported currencies:", error);
      throw error;
    }
  }
  async saveSupportedCurrencies(): Promise<CurrencyResponse> {
    const currencies = await this.getSupportedCurrencies();

    // Create all currency objects first
    const currencyPromises = Object.entries(currencies.symbols).map(
      async ([key, value]) => {
        const currency = new Currency();
        currency.code = key;
        currency.name = value;
        return this.currencyDataStore.firstOrCreate(currency);
      }
    );
    // Execute all saves in parallel
    await Promise.all(currencyPromises);
    return currencies;
  }
  async verifyCurrency(code: string): Promise<boolean> {
    const currency = await this.currencyDataStore.getCurrency(code);
    if (currency) {
      return true;
    }
    return false;
  }

  async convertCurrency(
    from: string,
    to: string,
    amount: number,
    date?: string
  ): Promise<ConvertCurrencyResponse> {
    // Check Redis cache first
    let req: ConvertCurrencyRequest = {
      from: from,
      to: to,
      amount: amount.toString(),
      date: date ? date : "",
    };
    if (process.env.ENV === environment.PRODUCTION) {
      const cachedRate = await this.memCache!.getConvertCurrency(req);
      if (cachedRate) {
        LogInfo("returning cached rate", "convert currency");
        return cachedRate;
      }
    }

    const params = new URLSearchParams();
    params.append("api_key", this.apiKey);
    params.append("from", from);
    params.append("to", to);
    params.append("amount", amount.toString());
    if (date) {
      params.append("date", date);
    }
    // check currency codes
    if (
      !(await this.verifyCurrency(from.toUpperCase())) ||
      !(await this.verifyCurrency(to.toUpperCase()))
    ) {
      throw new Error("Invalid currency code");
    }
    try {
      const response = await axios.get<ConvertCurrencyResponse>(
        `https://api.forexrateapi.com/v1/convert?${params.toString()}`
      );
      if (process.env.ENV === environment.PRODUCTION) {
        // Cache the response
        await this.memCache!.setConvertCurrency(req, response.data);
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      LogError("Error converting currency:", error);
      throw error;
    }
  }

  async getLiveRates(
    base: string,
    currencies: string[] | string
  ): Promise<LiveRatesResponse> {
    // convert currencies to array
    const currenciesArray = Array.isArray(currencies)
      ? currencies
      : [currencies];

    let req: LiveRatesRequest = {
      base: base,
      currencies: currenciesArray,
    };

    if (process.env.ENV === environment.PRODUCTION) {
      // Check Redis cache first
      const cachedRate = await this.memCache!.getCurrencyRate(req);
      if (cachedRate) {
        LogInfo("returning cached rate", "live rates");
        return cachedRate;
      }
    }
    // if not cached, fetch from API
    console.log(
      `Fetching fresh rates for ${base} to ${currenciesArray.join(",")}`
    );
    const params = new URLSearchParams();
    params.append("api_key", this.apiKey);
    params.append("base", base);
    if (currenciesArray.length > 0) {
      params.append("currencies", currenciesArray.join(","));
    }
    try {
      const response = await axios.get<LiveRatesResponse>(
        `https://api.forexrateapi.com/v1/latest?${params.toString()}`
      );
      if (process.env.ENV === environment.PRODUCTION) {
        // Cache the response
        await this.memCache!.setCurrencyRate(req, response.data);
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      LogError("Error getting live rates:", error);
      throw error;
    }
  }
}
