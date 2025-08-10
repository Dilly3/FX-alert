import { Currency } from "./../../model/model";
import { Router } from "express";
import {
  ensureAppReady,
  LogIP,
  RateLimiting,
  RateLimitingEmail,
} from "../middleware";
import { config } from "../../secrets/secrets_manager";
import { ErrorLogStore, UserDataStore } from "../../datastore/datastore";
import { Mailer } from "../../mailer/mailer";
import { IFXAgent } from "../../fx/fx_agent";
import { newCurrencyHandler } from "../handlers/currency_handler";
import { Validator } from "../validator/validator";

export const getCurrencyRouter = (
  secrets: config,
  validator: Validator,
  fxAgent: IFXAgent,
  mailer: Mailer,
  userStore: UserDataStore,
  errorLog: ErrorLogStore
): { CurrencyRouter: Router; CurrencyMailerRouter: Router } => {
  const commonMiddleware = [LogIP, ensureAppReady(), RateLimiting(secrets)];
  const mailerMiddleware = [
    LogIP,
    ensureAppReady(),
    RateLimitingEmail(secrets),
  ];
  const CurrencyMailerRouter = Router();
  const CurrencyRouter = Router();
  CurrencyRouter.use(commonMiddleware);
  CurrencyMailerRouter.use(mailerMiddleware);

  const currencyHandler = newCurrencyHandler(
    fxAgent,
    mailer,
    userStore,
    errorLog
  );

  CurrencyMailerRouter.get(
    "/rates",
    validator.liveRatesValidator(),
    currencyHandler.getLiveRates()
  );

  CurrencyRouter.get("/list", currencyHandler.listCurrencies());

  CurrencyRouter.get(
    "/convert",
    validator.convertCurrencyValidator(),
    currencyHandler.convertCurrency()
  );

  CurrencyRouter.post("/scheduler", currencyHandler.ratesScheduler());

  return { CurrencyRouter, CurrencyMailerRouter };
};
