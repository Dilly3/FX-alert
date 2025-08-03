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
exports.FirestoreCurrencyStore = void 0;
const model_1 = require("../../model/model");
class FirestoreCurrencyStore {
    constructor(db) {
        this.db = db;
        this.COLLECTION_NAME = model_1.collection.CURRENCY;
    }
    firstOrCreate(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Use currency code as document ID for easier querying
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
                const doc = yield docRef.get();
                if (doc.exists) {
                    // Document exists, return existing currency
                    const data = doc.data();
                    return Object.assign({ code: doc.id, name: (data === null || data === void 0 ? void 0 : data.name) || '' }, data);
                }
                else {
                    // Document doesn't exist, create new one
                    yield docRef.set({
                        code: currency.code,
                        name: currency.name,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    return {
                        code: currency.code,
                        name: currency.name
                    };
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to firstOrCreate currency: ${message}`);
            }
        });
    }
    bulkUpsert(currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batchSize = 100;
                const batches = [];
                for (let i = 0; i < currencies.length; i += batchSize) {
                    const batch = this.db.batch();
                    const batchCurrencies = currencies.slice(i, i + batchSize);
                    batchCurrencies.forEach(currency => {
                        const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
                        batch.set(docRef, {
                            name: currency.name,
                            code: currency.code,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }, { merge: true }); // Use merge to update existing or create new
                    });
                    batches.push(batch.commit());
                }
                yield Promise.all(batches);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to bulk upsert currencies: ${message}`);
            }
        });
    }
    getCurrency(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(code);
                const doc = yield docRef.get();
                if (!doc.exists) {
                    return null;
                }
                const data = doc.data();
                return Object.assign({ code: (data === null || data === void 0 ? void 0 : data.code) || '', name: (data === null || data === void 0 ? void 0 : data.name) || '' }, data);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get currency with code ${code}: ${message}`);
            }
        });
    }
    updateCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
                // Check if document exists
                const doc = yield docRef.get();
                if (!doc.exists) {
                    throw new Error(`Currency with code ${currency.code} not found`);
                }
                // Update the document
                yield docRef.update({
                    code: currency.code,
                    name: currency.name,
                    updatedAt: new Date().toISOString()
                });
                // Return the updated currency
                const updatedDoc = yield docRef.get();
                const data = updatedDoc.data();
                return Object.assign({ id: updatedDoc.id, code: (data === null || data === void 0 ? void 0 : data.code) || '', name: (data === null || data === void 0 ? void 0 : data.name) || '' }, data);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to update currency: ${message}`);
            }
        });
    }
    deleteCurrency(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(code);
                // Check if document exists before deleting
                const doc = yield docRef.get();
                if (!doc.exists) {
                    throw new Error(`Currency with code ${code} not found`);
                }
                yield docRef.delete();
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to delete currency with code ${code}: ${message}`);
            }
        });
    }
    getAllCurrencies() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .orderBy('name') // Order by name for consistency
                    .get();
                const currencies = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    currencies.push(Object.assign({ code: doc.id, name: (data === null || data === void 0 ? void 0 : data.name) || '' }, data));
                });
                return currencies;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get all currencies: ${message}`);
            }
        });
    }
    // Additional helper methods specific to Firestore
    saveCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
                yield docRef.set({
                    id: currency.code,
                    name: currency.name,
                    code: currency.code,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                return docRef;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to save currency: ${message}`);
            }
        });
    }
    saveCurrencies(currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = this.db.batch();
                const results = [];
                currencies.forEach(currency => {
                    const docRef = this.db.collection(this.COLLECTION_NAME).doc();
                    batch.set(docRef, {
                        id: currency.code,
                        code: currency.code,
                        name: currency.name,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    results.push(docRef);
                });
                yield batch.commit();
                return results;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to save currencies: ${message}`);
            }
        });
    }
    saveCurrenciesWithCustomIDs(currencies) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = this.db.batch();
                const results = [];
                currencies.forEach(currency => {
                    const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
                    batch.set(docRef, {
                        id: currency.code,
                        code: currency.code,
                        name: currency.name,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    results.push(docRef);
                });
                yield batch.commit();
                return results;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to save currencies with custom IDs: ${message}`);
            }
        });
    }
    // Query methods
    searchCurrencies(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Firestore doesn't support full-text search, so we do prefix matching
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('name', '>=', searchTerm)
                    .where('name', '<=', searchTerm + '\uf8ff')
                    .get();
                const currencies = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    currencies.push(Object.assign({ code: (data === null || data === void 0 ? void 0 : data.code) || '', name: (data === null || data === void 0 ? void 0 : data.name) || '' }, data));
                });
                return currencies;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to search currencies: ${message}`);
            }
        });
    }
    getCurrencyCount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME).get();
                return snapshot.size;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get currency count: ${message}`);
            }
        });
    }
    currencyExists(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = yield this.db.collection(this.COLLECTION_NAME).doc(code).get();
                return doc.exists;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to check if currency exists: ${message}`);
            }
        });
    }
}
exports.FirestoreCurrencyStore = FirestoreCurrencyStore;
