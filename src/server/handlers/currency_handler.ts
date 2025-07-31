import { ForexApi } from "../../fx/forex_api/forex_api";
import { LogError } from "../../logger/google.cloud.logger";
import express, { Request, Response, Express } from "express";
import { LiveRatesRequest } from "../../model/dtos";
import { SendGrid } from "../../mailer/sendgrid/sendgrid";
import { UserDataStore } from "../../datastore/datastore";

export class CurrencyHandler {
  constructor(
    private forexApi: ForexApi,
    private sendgrid: SendGrid,
    private userStore: UserDataStore
  ) { }

  listCurrencies = () => {
    return async (req: Request, res: Response) => {
    try {
      const currencies = await this.forexApi.getSupportedCurrencies();
      res.json({ message: "Currencies retrieved", currencies: currencies });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      LogError("Error getting currencies:", message);
      res
        .status(500)
        .json({ message: "Error getting currencies", error: message });
    }
  };
}

  convertCurrency = () => {
    return async (
    req: Request<
      {},
      {},
      {},
      { from: string; to: string; amount: number; date?: string }
    >,
    res: Response
  ) => {
    try {
      const request = req.query;
      const response = await this.forexApi.convertCurrency(
        request.from,
        request.to,
        request.amount,
        request.date
      );
      const result = this.forexApi.formatCurrency(response.result);
      res.json({
        message: "Currency converted",
        result: result,
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      LogError("Error converting currency:", message);
      res
        .status(500)
        .json({ message: "Error converting currency", error: message });
    }
  };
}

  getLiveRates = () => {
    return async (
    req: Request<{}, {}, {}, LiveRatesRequest>,
    res: Response
  ) => {
    try {
      const request = req.query;
      const response = await this.forexApi.getLiveRates(
        request.base,
        request.currencies
      );
      if (request.email) {
        //check email is verified
        const user = await this.userStore.getUser(request.email);
        if (!user || !user.isVerified) {
          res
            .status(400)
            .json({ message: "Email not verified", success: false });
          return;
        }
        await this.sendgrid.sendFxRateEmail(response, request.email);
        res.json({ message: "Live rates sent to mail", success: true });
      } else {
        res.json({
          message: "Live rates retrieved",
          rates: response.rates,
          success: true,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      LogError("Error getting live rates:", message);
      res
        .status(500)
        .json({ message: "Error getting live rates", error: message });
    }
  };
}
}

export const newCurrencyHandler = (
  forexApi: ForexApi,
  sendgrid: SendGrid,
  userStore: UserDataStore
) => {
  return new CurrencyHandler(forexApi, sendgrid, userStore);
};
