import { Firestore } from "@google-cloud/firestore";
import { collection, ErrorLog } from "../../model/model";
import { ErrorLogStore, UserDataStore } from "../datastore";

export class FirestoreErrorLogStore implements ErrorLogStore {
    private readonly COLLECTION_NAME = collection.ERROR_LOG;

    constructor(private readonly db: Firestore) {}

  async saveError(error: ErrorLog): Promise<void> {
        try {
            await this.db.collection(collection.ERROR_LOG).add({
                operation: error.operation,
                errorMessage: error.errorMessage,
                createdAt: new Date().toISOString(),
                date: error.date
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to log error: ${message}`);
        }
    }




}