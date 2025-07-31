import { rateLimit } from 'express-rate-limit';
import { AppState } from "./app";
import express, { Express } from "express";
import { newCurrencyHandler } from "./handlers/currency_handler";
import { ensureAppReady, RateLimiting, RateLimitingEmail } from "./middleware";
import { healthCheck } from "./handlers/health_handler";
import { config } from "../secrets/secrets_manager";
import { newUserHandler } from "./handlers/user_handler";
import { LiveRatesRequest } from '../model/dtos';
const cors = require('cors');



export function setupRoutes(appState: AppState, secrets: config) : Express {
const app: Express = express();
app.use(express.json());
app.use(ensureAppReady(appState!));
//TODO: Update cors origin for prod
const corsOptions = {
  origin: secrets!.env === 'prod' ? '*' : '*',
  credentials: true
};

const currencyHandler = newCurrencyHandler(appState!.forexApi!, appState!.sendgrid!, appState!.userStore!);
const userHandler = newUserHandler(appState!.userStore!, appState!.sendgrid!, secrets!);

app.use(cors(corsOptions));
app.use(RateLimiting(secrets!));
app.use(ensureAppReady(appState!));




app.get('/v1/health', healthCheck(appState!.dbFirestore, appState!.dbPG, appState!.isAppReady));

const v1Router = express.Router();
v1Router.use(ensureAppReady(appState!));
v1Router.use(RateLimiting(secrets!));

const v1CurrencyRouter = express.Router();
v1CurrencyRouter.use(ensureAppReady(appState!));
v1CurrencyRouter.use(RateLimiting(secrets!));

const v1CurrencyEmailRouter = express.Router();
v1CurrencyEmailRouter.use(ensureAppReady(appState!));
v1CurrencyEmailRouter.use(RateLimitingEmail(secrets!));

v1CurrencyEmailRouter.get('/rates', currencyHandler.getLiveRates());
v1CurrencyRouter.get('/list', currencyHandler.listCurrencies());
v1CurrencyRouter.get('/convert', currencyHandler.convertCurrency());
v1Router.post('/user/register', userHandler.createUser);
v1Router.get('/user/verify', userHandler.verifyUser);

app.use('/v1', v1Router);
app.use('/v1/currency', v1CurrencyRouter);
app.use('/v1/currency', v1CurrencyEmailRouter);


return app;
}