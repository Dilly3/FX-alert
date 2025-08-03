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
exports.PgCurrencyStore = void 0;
const model_1 = require("../../model/model");
class PgCurrencyStore {
    constructor(db) {
        this.db = db;
        this.currencyRepository = this.db.getRepository(model_1.Currency);
    }
    firstOrCreate(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.currencyRepository.upsert(currency, {
                    conflictPaths: ['code'],
                    skipUpdateIfNoValuesChanged: true
                });
                const result = yield this.currencyRepository.findOne({
                    where: { code: currency.code }
                });
                if (!result) {
                    throw new Error(`Failed to create or find currency with code: ${currency.code}`);
                }
                return result;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to firstOrCreate currency: ${error.message}`);
                }
                throw new Error(`Failed to firstOrCreate currency: ${error}`);
            }
        });
    }
    saveCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.currencyRepository.save(currency);
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to save currency: ${error.message}`);
                }
                throw new Error(`Failed to save currency: ${error}`);
            }
        });
    }
    getCurrency(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.currencyRepository.findOne({
                    where: { code: code }
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to get currency with code ${code}: ${error.message}`);
                }
                throw new Error(`Failed to get currency with code ${code}: ${error}`);
            }
        });
    }
    updateCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateResult = yield this.currencyRepository.update({ code: currency.code }, currency);
                if (updateResult.affected === 0) {
                    throw new Error(`Currency with code ${currency.code} not found`);
                }
                const updatedCurrency = yield this.currencyRepository.findOne({
                    where: { code: currency.code }
                });
                if (!updatedCurrency) {
                    throw new Error(`Failed to retrieve updated currency with code: ${currency.code}`);
                }
                return updatedCurrency;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to update currency: ${error.message}`);
                }
                throw new Error(`Failed to update currency: ${error}`);
            }
        });
    }
    deleteCurrency(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleteResult = yield this.currencyRepository.delete({ code });
                if (deleteResult.affected === 0) {
                    throw new Error(`Currency with code ${code} not found`);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to delete currency with code ${code}: ${error.message}`);
                }
                throw new Error(`Failed to delete currency with code ${code}: ${error}`);
            }
        });
    }
    getAllCurrencies() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.currencyRepository.find({
                    order: { code: 'ASC' }
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to get all currencies: ${error.message}`);
                }
                throw new Error(`Failed to get all currencies: ${error}`);
            }
        });
    }
    bulkUpsert(currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.currencyRepository.upsert(currencies, {
                    conflictPaths: ['code'],
                    skipUpdateIfNoValuesChanged: true
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to bulk upsert currencies: ${error.message}`);
                }
                throw new Error(`Failed to bulk upsert currencies: ${error}`);
            }
        });
    }
}
exports.PgCurrencyStore = PgCurrencyStore;
