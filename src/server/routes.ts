import { CurrencyDataStore } from "./../datastore/datastore";
import express, { Express, Router } from "express";
import { healthCheck } from "./handlers/health_handler";
import { Validator } from "./validator/validator";
import { AppConfig } from "./app";
import { ErrorLogStore, UserDataStore } from "../datastore/datastore";
import { Mailer } from "../mailer/mailer";
import { IFXAgent } from "../fx/fx_agent";
import { getCurrencyRouter } from "./router/currency_router";
import { getUserRouter } from "./router/user_router";

const cors = require("cors");

export function setupRoutes(
  appConfig: AppConfig,
  userStore: UserDataStore,
  currencyStore: CurrencyDataStore,
  errorLog: ErrorLogStore,
  fxAgent: IFXAgent,
  mailer: Mailer
): Express {
  if (!appConfig) {
    throw new Error("AppConfig not initialized");
  }

  const app: Express = express();

  // Middleware setup
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(
    cors({
      origin:
        appConfig?.secrets?.env === "prod"
          ? "https://your-production-domain.com"
          : "*",
      credentials: true,
    })
  );

  const validator = new Validator(currencyStore);

  // Health check route
  app.get("/v1/health", healthCheck(appConfig.dbFirestore!, appConfig.dbPG!));

  // Apply routers
  const { CurrencyRouter, CurrencyMailerRouter } = getCurrencyRouter(
    appConfig.secrets!,
    validator,
    fxAgent,
    mailer,
    userStore,
    errorLog
  );

  const userRouter = getUserRouter(
    userStore,
    validator,
    mailer,
    appConfig.secrets!
  );

  app.use("/v1/currency", CurrencyRouter);
  app.use("/v1/currency", CurrencyMailerRouter);
  app.use("/v1/user", userRouter);

  return app;
}
