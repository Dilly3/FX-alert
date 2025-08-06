import { AppState } from "./app";
import express, { Express, Router } from "express";
import { newCurrencyHandler } from "./handlers/currency_handler";
import { ensureAppReady, RateLimiting, RateLimitingEmail, LogIP } from "./middleware";
import { healthCheck } from "./handlers/health_handler";
import { newUserHandler } from "./handlers/user_handler";
import { Validator } from "../validator/validator";
const cors = require ('cors');

export function setupRoutes(appState: AppState): Express {
 if (!appState) {
        throw new Error("AppState not initialized");
    }
  const app: Express = express();
  const v1Router = Router();
  const v1CurrencyRouter = Router();
  const v1CurrencyEmailRouter = Router();

  // Middleware setup
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(cors({
    origin: appState?.secrets?.env === 'prod' ? 'https://your-production-domain.com' : '*',
    credentials: true
  }));
  const commonMiddleware = [
    LogIP,
    ensureAppReady(appState),
    RateLimiting(appState.secrets!)
  ];
 const mailerMiddleware = [
    LogIP,
    ensureAppReady(appState),
    RateLimitingEmail(appState.secrets!)
  ];

  // Apply common middleware
  app.use(commonMiddleware);
  v1Router.use(commonMiddleware);
  v1CurrencyRouter.use(commonMiddleware);
  v1CurrencyEmailRouter.use(mailerMiddleware);

  // Initialize handlers
  const currencyHandler = newCurrencyHandler(appState.forexApi!, appState.sendgrid!, appState.userStore!, appState.errorLog!);
  const userHandler = newUserHandler(appState.userStore!, appState.sendgrid!, appState.secrets!);
const validator = new Validator(appState.userStore!, appState.currencyStore!);

  // Health check route
  app.get('/v1/health', healthCheck(appState.dbFirestore!, appState.dbPG!, appState.isAppReady!));

  // Currency routes
  v1CurrencyEmailRouter.get('/rates', validator.liveRatesValidator, currencyHandler.getLiveRates());
  v1CurrencyRouter.get('/list', currencyHandler.listCurrencies());
  v1CurrencyRouter.get('/convert', validator.convertCurrencyValidator, currencyHandler.convertCurrency());
  v1CurrencyRouter.post('/scheduler', currencyHandler.ratesScheduler());

  // User routes
  v1Router.post('/user/register', validator.RegisterUserValidator, userHandler.createUser);
  v1Router.get('/user/verify', validator.verifyUserValidator, userHandler.verifyUser);

  // Apply routers
  app.use('/v1', v1Router);
  app.use('/v1/currency', v1CurrencyRouter, v1CurrencyEmailRouter);

  return app;
}