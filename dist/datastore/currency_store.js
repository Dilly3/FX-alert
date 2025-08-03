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
exports.Currency = void 0;
const store_1 = require("./store");
class Currency {
    constructor(db) {
        this.db = db;
    }
    saveCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.collection(store_1.collection.CURRENCY).add(currency);
        });
    }
    saveCurrencies(currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = this.db.batch();
                const results = [];
                currencies.forEach(currency => {
                    const docRef = this.db.collection(store_1.collection.CURRENCY).doc();
                    batch.set(docRef, currency);
                    results.push(docRef);
                });
                yield batch.commit();
                console.log(`Successfully saved ${currencies.length} currencies`);
                return results;
            }
            catch (error) {
                console.error('Error saving currency array:', error);
                throw error;
            }
        });
    }
    saveCurrenciesWithCustomIDs(currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = this.db.batch();
                const results = [];
                currencies.forEach(currency => {
                    // Use currency code as document ID
                    const docRef = this.db.collection(store_1.collection.CURRENCY).doc(currency.code);
                    batch.set(docRef, currency);
                    results.push(docRef);
                });
                yield batch.commit();
                console.log(`Successfully saved ${currencies.length} currencies`);
                return results;
            }
            catch (error) {
                console.error('Error saving currencies:', error);
                throw error;
            }
        });
    }
}
exports.Currency = Currency;
