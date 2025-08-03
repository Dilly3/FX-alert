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
    if (secrets.env === 'prod' || secrets.env === 'sandbox') {
        app.use((0, middleware_1.RateLimiting)(secrets));
    }
    app.use((0, middleware_1.ensureAppReady)(appState));
    const corsOptions = {
        origin: secrets.env === 'prod' ? 'https://fx-alert.com' : '*',
        credentials: true
    };
    const currencyHandler = (0, currency_handler_1.newCurrencyHandler)(appState.forexApi);
    const userHandler = (0, user_handler_1.newUserHandler)(appState.userStore, appState.sendgrid);
    app.use(cors(corsOptions));
    app.get('/health', (0, health_handler_1.healthCheck)(appState.dbFirestore, appState.dbPG, appState.isAppReady));
    app.get('/v1/currency/list', currencyHandler.listCurrencies);
    app.get('/v1/currency/convert', currencyHandler.convertCurrency);
    app.get('/v1/currency/rates', currencyHandler.getLiveRates);
    app.post('/v1/user/create', userHandler.createUser);
    app.post('/v1/user/verify', userHandler.verifyUser);
    return app;
}
