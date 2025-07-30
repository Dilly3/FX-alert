import { ForexApi } from "../../fx/forex_api/forex_api";
import { LogError } from "../../logger/google.cloud.logger";
import express, { Request, Response, Express } from 'express';


export class CurrencyHandler {
  constructor(private forexApi: ForexApi) {}

  listCurrencies = async (req: Request, res: Response) => {
    try {
      const currencies = await this.forexApi.getSupportedCurrencies();
      res.json({ message: 'Currencies retrieved', currencies: currencies });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogError('Error getting currencies:', message);
      res.status(500).json({ message: 'Error getting currencies', error: message });
    }
  }

  convertCurrency = async (req: Request<{}, {}, {}, {from: string, to: string, amount: number, date?: string}>, res: Response) => {
    try {
      const request = req.query;
      const response = await this.forexApi.convertCurrency(request.from, request.to, request.amount, request.date);
      const result = this.forexApi.formatCurrency(response.result);
      res.json({ message: 'Currency converted', response: result, success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogError('Error converting currency:', message);
      res.status(500).json({ message: 'Error converting currency', error: message });
    }
  }

  getLiveRates = async (req: Request<{}, {}, {}, {base: string, currencies: string[]}>, res: Response) => {
    try {
      const request = req.query;
      const response = await this.forexApi.getLiveRates(request.base, request.currencies);
      res.json({ message: 'Live rates retrieved', response: response.rates, success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogError('Error getting live rates:', message);
      res.status(500).json({ message: 'Error getting live rates', error: message });
    }
  }
}

const listCurrencies = ( forexApi: ForexApi ) => {
return async (req: Request, res: Response) => {
try {
 const  currencies = await forexApi.getSupportedCurrencies();
 res.json({ message: 'Currencies retrieved', currencies: currencies });
} catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    LogError('Error getting currencies:', message);
    res.status(500).json({ message: 'Error getting currencies', error: message });
}
} 
}

const convertCurrency = ( forexApi: ForexApi ) => {
return async (req: Request<{}, {}, {}, {from: string, to: string, amount: number, date?: string}>, res: Response) => {
try {
  const request = req.query;
  const response = await forexApi!.convertCurrency(request.from, request.to, request.amount, request.date);
  const result = forexApi!.formatCurrency(response.result);
  res.json({ message: 'Currency converted', response: result, success: true });
} catch (error) {
  LogError('Error converting currency:', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ message: 'Error converting currency', error: message });
}
}
}

const getLiveRates = ( forexApi: ForexApi ) => {
return async (req: Request<{}, {}, {}, {base: string, currencies: string[]}>, res: Response) => {
try {
  const request = req.query;  
  const response = await forexApi!.getLiveRates(request.base, request.currencies);
  res.json({ message: 'Live rates retrieved', response: response.rates, success: true });
} catch (error) {
  LogError('Error getting live rates:', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ message: 'Error getting live rates', error: message });
}
}
}

export const newCurrencyHandler = ( forexApi: ForexApi ) => {
  return new CurrencyHandler(forexApi);
}

