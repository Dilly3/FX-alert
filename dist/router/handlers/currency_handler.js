"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newCurrencyHandler = exports.CurrencyHandler = void 0;
const google_cloud_logger_1 = require("../../logger/google.cloud.logger");
class CurrencyHandler {
    constructor(forexApi) {
        this.forexApi = forexApi;
        this.listCurrencies = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currencies = yield this.forexApi.getSupportedCurrencies();
                res.json({ message: 'Currencies retrieved', currencies: currencies });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                (0, google_cloud_logger_1.LogError)('Error getting currencies:', message);
                res.status(500).json({ message: 'Error getting currencies', error: message });
            }
        });
        this.convertCurrency = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.query;
                const response = yield this.forexApi.convertCurrency(request.from, request.to, request.amount, request.date);
                const result = this.forexApi.formatCurrency(response.result);
                res.json({ message: 'Currency converted', response: result, success: true });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                (0, google_cloud_logger_1.LogError)('Error converting currency:', message);
                res.status(500).json({ message: 'Error converting currency', error: message });
            }
        });
        this.getLiveRates = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.query;
                const response = yield this.forexApi.getLiveRates(request.base, request.currencies);
                res.json({ message: 'Live rates retrieved', response: response.rates, success: true });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                (0, google_cloud_logger_1.LogError)('Error getting live rates:', message);
                res.status(500).json({ message: 'Error getting live rates', error: message });
            }
        });
    }
}
exports.CurrencyHandler = CurrencyHandler;
const listCurrencies = (forexApi) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const currencies = yield forexApi.getSupportedCurrencies();
            res.json({ message: 'Currencies retrieved', currencies: currencies });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            (0, google_cloud_logger_1.LogError)('Error getting currencies:', message);
            res.status(500).json({ message: 'Error getting currencies', error: message });
        }
    });
};
const convertCurrency = (forexApi) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req.query;
            const response = yield forexApi.convertCurrency(request.from, request.to, request.amount, request.date);
            const result = forexApi.formatCurrency(response.result);
            res.json({ message: 'Currency converted', response: result, success: true });
        }
        catch (error) {
            (0, google_cloud_logger_1.LogError)('Error converting currency:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ message: 'Error converting currency', error: message });
        }
    });
};
const getLiveRates = (forexApi) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req.query;
            const response = yield forexApi.getLiveRates(request.base, request.currencies);
            res.json({ message: 'Live rates retrieved', response: response.rates, success: true });
        }
        catch (error) {
            (0, google_cloud_logger_1.LogError)('Error getting live rates:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ message: 'Error getting live rates', error: message });
        }
    });
};
const newCurrencyHandler = (forexApi) => {
    return new CurrencyHandler(forexApi);
};
exports.newCurrencyHandler = newCurrencyHandler;
