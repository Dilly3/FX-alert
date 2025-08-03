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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForexApi = void 0;
const model_1 = require("../../model/model");
const axios_1 = __importDefault(require("axios"));
const gcp_logger_1 = require("../../logger/gcp_logger");
class ForexApi {
    formatCurrency(amount) {
        return this.formatter.format(amount);
    }
    constructor(apiKey, currencyDataStore, redisClient) {
        this.apiKey = apiKey;
        this.currencyDataStore = currencyDataStore;
        this.redisClient = redisClient;
        this.formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    getSupportedCurrencies() {
        return __awaiter(this, void 0, void 0, function* () {
            // check database first
            const currencies = yield this.currencyDataStore.getAllCurrencies();
            if (currencies.length > 0) {
                return {
                    success: true,
                    symbols: currencies.reduce((acc, currency) => {
                        acc[currency.code] = currency.name;
                        return acc;
                    }, {})
                };
            }
            // if not, get from api and save to database
            const params = new URLSearchParams();
            params.append('api_key', this.apiKey);
            try {
                const response = yield axios_1.default.get(`https://api.forexrateapi.com/v1/symbols?${params.toString()}`);
                const { data } = response;
                yield this.currencyDataStore.bulkUpsert(Object.entries(data.symbols).map(([key, value]) => ({
                    id: key,
                    code: key,
                    name: value
                })));
                return data;
            }
            catch (error) {
                (0, gcp_logger_1.LogError)('Error getting supported currencies:', error);
                throw error;
            }
        });
    }
    saveSupportedCurrencies() {
        return __awaiter(this, void 0, void 0, function* () {
            const currencies = yield this.getSupportedCurrencies();
            // Create all currency objects first
            const currencyPromises = Object.entries(currencies.symbols).map((_a) => __awaiter(this, [_a], void 0, function* ([key, value]) {
                const currency = new model_1.Currency();
                currency.code = key;
                currency.name = value;
                return this.currencyDataStore.firstOrCreate(currency);
            }));
            // Execute all saves in parallel
            yield Promise.all(currencyPromises);
            return currencies;
        });
    }
    verifyCurrency(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const currency = yield this.currencyDataStore.getCurrency(code);
            if (currency) {
                return true;
            }
            return false;
        });
    }
    convertCurrency(from, to, amount, date) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check Redis cache first
            let req = {
                from: from,
                to: to,
                amount: amount.toString(),
                date: date ? date : ""
            };
            const cachedRate = yield this.redisClient.getConvertCurrency(req);
            if (cachedRate) {
                (0, gcp_logger_1.LogInfo)("returning cached rate", "convert currency");
                return cachedRate;
            }
            const params = new URLSearchParams();
            params.append('api_key', this.apiKey);
            params.append('from', from);
            params.append('to', to);
            params.append('amount', amount.toString());
            if (date) {
                params.append('date', date);
            }
            // check currency codes 
            if (!(yield this.verifyCurrency(from.toUpperCase())) || !(yield this.verifyCurrency(to.toUpperCase()))) {
                throw new Error('Invalid currency code');
            }
            try {
                const response = yield axios_1.default.get(`https://api.forexrateapi.com/v1/convert?${params.toString()}`);
                // Cache the response
                yield this.redisClient.setConvertCurrency(req, response.data);
                return response.data;
            }
            catch (error) {
                (0, gcp_logger_1.LogError)('Error converting currency:', error);
                throw error;
            }
        });
    }
    getLiveRates(base, currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            // convert currencies to array
            const currenciesArray = Array.isArray(currencies) ? currencies : [currencies];
            let req = {
                base: base,
                currencies: currenciesArray
            };
            // Check Redis cache first
            const cachedRate = yield this.redisClient.getCurrencyRate(req);
            if (cachedRate) {
                (0, gcp_logger_1.LogInfo)("returning cached rate", "live rates");
                return cachedRate;
            }
            // if not cached, fetch from API
            console.log(`Fetching fresh rates for ${base} to ${currenciesArray.join(',')}`);
            const params = new URLSearchParams();
            params.append('api_key', this.apiKey);
            params.append('base', base);
            if (currenciesArray.length > 0) {
                params.append('currencies', currenciesArray.join(','));
            }
            try {
                const response = yield axios_1.default.get(`https://api.forexrateapi.com/v1/latest?${params.toString()}`);
                // Cache the response
                yield this.redisClient.setCurrencyRate(req, response.data);
                return response.data;
            }
            catch (error) {
                (0, gcp_logger_1.LogError)('Error getting live rates:', error);
                throw error;
            }
        });
    }
}
exports.ForexApi = ForexApi;
