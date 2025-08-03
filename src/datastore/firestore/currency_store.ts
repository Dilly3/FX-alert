import { Firestore, DocumentReference, DocumentData } from "@google-cloud/firestore";
import { Currency, UserInfo, collection } from "../../model/model";
import { CurrencyDataStore } from "../datastore";

export class FirestoreCurrencyStore implements CurrencyDataStore {
    private readonly COLLECTION_NAME = collection.CURRENCY;

    constructor(private readonly db: Firestore) {}

    async firstOrCreate(currency: Currency): Promise<Currency> {
        try {
            // Use currency code as document ID for easier querying
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
            const doc = await docRef.get();

            if (doc.exists) {
                // Document exists, return existing currency
                const data = doc.data();
                return {
                    code: doc.id,
                    name: data?.name || '',
                    ...data
                } as Currency;
            } else {
                // Document doesn't exist, create new one
                await docRef.set({
                    code: currency.code,
                    name: currency.name,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                return {
                    code: currency.code,
                    name: currency.name
                } as Currency;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to firstOrCreate currency: ${message}`);
        }
    }

    async bulkUpsert(currencies: Currency[]): Promise<void> {
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

            await Promise.all(batches);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to bulk upsert currencies: ${message}`);
        }
    }

    async getCurrency(code: string): Promise<Currency | null> {
        try {
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(code);
            const doc = await docRef.get();

            if (!doc.exists) {
                return null;
            }

            const data = doc.data();
            return {
                code: data?.code || '',
                name: data?.name || '',
                ...data
            } as Currency;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get currency with code ${code}: ${message}`);
        }
    }

    async updateCurrency(currency: Currency): Promise<Currency> {
        try {
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
            
            // Check if document exists
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new Error(`Currency with code ${currency.code} not found`);
            }

            // Update the document
            await docRef.update({
                code: currency.code,
                name: currency.name,
                updatedAt: new Date().toISOString()
            });

            // Return the updated currency
            const updatedDoc = await docRef.get();
            const data = updatedDoc.data();
            
            return {
                id: updatedDoc.id,
                code: data?.code || '',
                name: data?.name || '',
                ...data
            } as Currency;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update currency: ${message}`);
        }
    }

    async deleteCurrency(code: string): Promise<void> {
        try {
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(code);
            
            // Check if document exists before deleting
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new Error(`Currency with code ${code} not found`);
            }

            await docRef.delete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to delete currency with code ${code}: ${message}`);
        }
    }

    async getAllCurrencies(): Promise<Currency[]> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .orderBy('name') // Order by name for consistency
                .get();

            const currencies: Currency[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                currencies.push({
                    code: doc.id,
                    name: data?.name || '',
                    ...data
                } as Currency);
            });

            return currencies;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get all currencies: ${message}`);
        }
    }

    // Additional helper methods specific to Firestore
    async saveCurrency(currency: Currency): Promise<DocumentReference<DocumentData>> {
        try {
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(currency.code);
            await docRef.set({
                id: currency.code,
                name: currency.name,
                code: currency.code,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return docRef;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to save currency: ${message}`);
        }
    }

    async saveCurrencies(currencies: Currency[]): Promise<DocumentReference<DocumentData>[]> {
        try {
            const batch = this.db.batch();
            const results: DocumentReference<DocumentData>[] = [];

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

            await batch.commit();
            return results;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to save currencies: ${message}`);
        }
    }

    async saveCurrenciesWithCustomIDs(currencies: Currency[]): Promise<DocumentReference<DocumentData>[]> {
        try {
            const batch = this.db.batch();
            const results: DocumentReference<DocumentData>[] = [];

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

            await batch.commit();
            return results;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to save currencies with custom IDs: ${message}`);
        }
    }

    // Query methods
    async searchCurrencies(searchTerm: string): Promise<Currency[]> {
        try {
            // Firestore doesn't support full-text search, so we do prefix matching
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('name', '>=', searchTerm)
                .where('name', '<=', searchTerm + '\uf8ff')
                .get();

            const currencies: Currency[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                currencies.push({
                    code: data?.code || '',
                    name: data?.name || '',
                    ...data
                } as Currency);
            });

            return currencies;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to search currencies: ${message}`);
        }
    }

    async getCurrencyCount(): Promise<number> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME).get();
            return snapshot.size;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get currency count: ${message}`);
        }
    }

    async currencyExists(code: string): Promise<boolean> {
        try {
            const doc = await this.db.collection(this.COLLECTION_NAME).doc(code).get();
            return doc.exists;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to check if currency exists: ${message}`);
        }
    }


}