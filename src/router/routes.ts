import { AppState } from "./app";
import express, { Express } from "express";
import { convertCurrency, getLiveRates, listCurrencies } from "./handlers/currency_handler";
import { ensureAppReady, RateLimiting } from "./middleware";
import { healthCheck } from "./handlers/health_handler";
import { config } from "../secrets/secrets_manager";
const cors = require('cors');



export function setupRoutes(appState: AppState, secrets: config) : Express {
const app: Express = express();
app.use(express.json());
  app.use(express.json());
app.use(RateLimiting(secrets!));
app.use(ensureAppReady(appState!));
const corsOptions = {
  origin: secrets!.env === 'prod' ? 'https://fx-alert.com' : '*',
  credentials: true
};

app.use(cors(corsOptions));
app.get('/health', healthCheck(appState!.dbFirestore, appState!.dbPG, appState!.isAppReady));
app.get('/currency/list', listCurrencies(appState!.forexApi!));
app.get('/currency/convert', convertCurrency(appState!.forexApi!));
app.get('/currency/rates', getLiveRates(appState!.forexApi!));
  return app;
}