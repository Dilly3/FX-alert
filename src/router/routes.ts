import { AppState } from "./app";
import express, { Express } from "express";
import { newCurrencyHandler } from "./handlers/currency_handler";
import { ensureAppReady, RateLimiting } from "./middleware";
import { healthCheck } from "./handlers/health_handler";
import { config } from "../secrets/secrets_manager";
import { newUserHandler } from "./handlers/user_handler";
const cors = require('cors');



export function setupRoutes(appState: AppState, secrets: config) : Express {
const app: Express = express();
app.use(express.json());
if (secrets!.env === 'prod' || secrets!.env === 'sandbox') {
  app.use(RateLimiting(secrets!));
}

app.use(ensureAppReady(appState!));
const corsOptions = {
  origin: secrets!.env === 'prod' ? 'https://fx-alert.com' : '*',
  credentials: true
};

const currencyHandler = newCurrencyHandler(appState!.forexApi!);
const userHandler = newUserHandler(appState!.userStore!, appState!.sendgrid!);

app.use(cors(corsOptions));
app.get('/health', healthCheck(appState!.dbFirestore, appState!.dbPG, appState!.isAppReady));
app.get('/v1/currency/list', currencyHandler.listCurrencies);
app.get('/v1/currency/convert', currencyHandler.convertCurrency);
app.get('/v1/currency/rates', currencyHandler.getLiveRates);

app.post('/v1/user/create', userHandler.createUser);
app.post('/v1/user/verify', userHandler.verifyUser);
  return app;
}