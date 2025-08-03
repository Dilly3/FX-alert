"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const express_1 = __importDefault(require("express"));
const currency_handler_1 = require("./handlers/currency_handler");
const middleware_1 = require("./middleware");
const health_handler_1 = require("./handlers/health_handler");
const user_handler_1 = require("./handlers/user_handler");
const cors = require('cors');
function setupRoutes(appState, secrets) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // trust the first proxy (GCP API Gateway) 
    app.set('trust proxy', 1);
    app.use((0, middleware_1.ensureAppReady)(appState));
    //TODO: Update cors origin for prod
    const corsOptions = {
        origin: secrets.env === 'prod' ? '*' : '*',
        credentials: true
    };
    const currencyHandler = (0, currency_handler_1.newCurrencyHandler)(appState.forexApi, appState.sendgrid, appState.userStore, appState.errorLog);
    const userHandler = (0, user_handler_1.newUserHandler)(appState.userStore, appState.sendgrid, secrets);
    // Middlewares
    app.use(cors(corsOptions));
    app.use((0, middleware_1.LogIP)());
    app.use((0, middleware_1.RateLimiting)(secrets));
    app.use((0, middleware_1.ensureAppReady)(appState));
    app.get('/v1/health', (0, health_handler_1.healthCheck)(appState.dbFirestore, appState.dbPG, appState.isAppReady));
    const v1Router = express_1.default.Router();
    v1Router.use((0, middleware_1.ensureAppReady)(appState));
    v1Router.use((0, middleware_1.RateLimiting)(secrets));
    const v1CurrencyRouter = express_1.default.Router();
    v1CurrencyRouter.use((0, middleware_1.ensureAppReady)(appState));
    v1CurrencyRouter.use((0, middleware_1.RateLimiting)(secrets));
    const v1CurrencyEmailRouter = express_1.default.Router();
    v1CurrencyEmailRouter.use((0, middleware_1.ensureAppReady)(appState));
    v1CurrencyEmailRouter.use((0, middleware_1.RateLimitingEmail)(secrets));
    v1CurrencyEmailRouter.get('/rates', currencyHandler.getLiveRates());
    v1CurrencyRouter.get('/list', currencyHandler.listCurrencies());
    v1CurrencyRouter.get('/convert', currencyHandler.convertCurrency());
    v1CurrencyRouter.post('/scheduler', currencyHandler.ratesScheduler());
    v1Router.post('/user/register', userHandler.createUser);
    v1Router.get('/user/verify', userHandler.verifyUser);
    app.use('/v1', v1Router);
    app.use('/v1/currency', v1CurrencyRouter);
    app.use('/v1/currency', v1CurrencyEmailRouter);
    return app;
}
