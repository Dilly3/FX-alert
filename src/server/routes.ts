import {
  CurrencyHandlerUserStore,
  UserHandlerUserStore,
  ValidatorCurrencyStore,
} from "./../datastore/datastore";
import express, { Express } from "express";
import { healthCheck } from "./handlers/health_handler";
import { AppConfig } from "./app";
import { ErrorLogStore } from "../datastore/datastore";
import { Mailer } from "../mailer/mailer";
import { IFXAgent } from "../fx/fx_agent";
import { getCurrencyRouter } from "./router/currency_router";
import { getUserRouter } from "./router/user_router";

import cors from "cors";

export function setupApp(
  env: string,
  userStore: CurrencyHandlerUserStore | null
): Express {
  const app: Express = express();

  // Middleware setup
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(
    cors({
      origin: env === "prod" ? "https://your-production-domain.com" : "*",
      credentials: true,
    })
  );

  // Health check route
  app.get("/v1/health", healthCheck(userStore));
  return app;
}

// Apply routers
export function setCurrencyRouter(
  app: Express,
  appConfig: AppConfig,
  validatordb: ValidatorCurrencyStore,
  fxAgent: IFXAgent,
  mailer: Mailer,
  userStore: CurrencyHandlerUserStore,
  errorlog: ErrorLogStore
) {
  const appC = getCurrencyRouter(
    app,
    appConfig.secrets!,
    validatordb,
    fxAgent,
    mailer,
    userStore,
    errorlog
  );

  return appC;
}

export function setUserRouter(
  app: Express,
  userStore: UserHandlerUserStore,
  validatordb: ValidatorCurrencyStore,
  mailer: Mailer,
  appconfig: AppConfig
): Express {
  const appU = getUserRouter(
    app,
    userStore,
    validatordb,
    mailer,
    appconfig.secrets!
  );
  return appU;
}
