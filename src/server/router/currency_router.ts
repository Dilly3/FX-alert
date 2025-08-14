import { ValidatorCurrencyStore } from "./../../datastore/datastore";
import { Express, Router } from "express";
import {
  ensureAppReady,
  LogIP,
  RateLimiting,
  RateLimitingEmail,
} from "../middleware";
import { config } from "../../secrets/secrets_manager";
import {
  CurrencyHandlerUserStore,
  ErrorLogStore,
} from "../../datastore/datastore";
import { Mailer } from "../../mailer/mailer";
import { IFXAgent } from "../../fx/fx_agent";
import { newCurrencyHandler } from "../handlers/currency_handler";
import { newValidator } from "../validator/validator";

export const getCurrencyRouter = (
  app: Express,
  secrets: config,
  validatordb: ValidatorCurrencyStore,
  fxAgent: IFXAgent,
  mailer: Mailer,
  userStore: CurrencyHandlerUserStore,
  errorLog: ErrorLogStore
): Express => {
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
  const validator = newValidator(validatordb);
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
  app.use("/v1/currency", CurrencyRouter);
  app.use("/v1/currency", CurrencyMailerRouter);
  return app;
};
