import { Firestore } from "@google-cloud/firestore";
import { Currency, UserInfo } from "../model/model";
import { FirestoreCurrencyStore } from "./firestore/currency_store";
import { PgCurrencyStore } from "./postgres/pg_currency_store";
import { DataSource } from "typeorm";
import { PgUserStore } from "./postgres/pg_user_store";
import { FirestoreUserStore } from "./firestore/user_store";
import { default_config, isRunningInGCP } from "../secrets/secrets_manager";
import { initializePgDB } from "./postgres/pg_store";
import { initializeFirestore } from "./firestore/store";


export interface CurrencyDataStore {
    firstOrCreate(currency: Currency): Promise<Currency>;
    bulkUpsert(currencies: Currency[]): Promise<void>;
    getCurrency(code: string): Promise<Currency | null>;
    updateCurrency(currency: Currency): Promise<Currency>;
    deleteCurrency(code: string): Promise<void>;
    getAllCurrencies(): Promise<Currency[]>;
}

export interface UserDataStore {
    firstOrCreate(user: UserInfo): Promise<UserInfo>;
    updatePin(email: string, pin: string): Promise<void>;
    getVerificationPin(email: string): Promise<string>;
    verifyUser(email: string): Promise<void>;
    saveUser(user: UserInfo): Promise<UserInfo>;
    getUser(email: string): Promise<UserInfo | null>;
    updateUser(user: UserInfo): Promise<UserInfo>;
    deleteUser(id: string): Promise<void>;
    validatePin(pin: string, user: UserInfo): boolean;
    generatePin(): string;
} 

let currencyDataStore: CurrencyDataStore | null = null;
let userDataStore: UserDataStore | null = null;

export function getCurrencyDataStore(dbpg: DataSource | null, dbFirestore: Firestore | null): CurrencyDataStore {
    const isGCP = isRunningInGCP();
    if(currencyDataStore){
        return currencyDataStore;
    }
    if (isGCP) {
        if (!dbFirestore) {
            throw new Error("Firestore connection not available for GCP environment");
        }
        currencyDataStore = new FirestoreCurrencyStore(dbFirestore);
    } else {
        if (!dbpg) {
            throw new Error("PostgreSQL connection not available for local environment");
        }
        currencyDataStore = new PgCurrencyStore(dbpg);
    }
    return currencyDataStore;
}

export function getUserStore(dbpg: DataSource | null, dbFirestore: Firestore | null): UserDataStore {
   const isGCP = isRunningInGCP();
   if(userDataStore){
        return userDataStore;
    }
    if (isGCP) {
        if (!dbFirestore) {
            throw new Error("Firestore connection not available for GCP environment");
        }
        userDataStore = new FirestoreUserStore(dbFirestore);
    } else {
        if (!dbpg) {
            throw new Error("PostgreSQL connection not available for local environment");
        }
        userDataStore = new PgUserStore(dbpg);
    }
    return userDataStore;
}

export async function initializeDatabases(dbFirestore: Firestore | null, dbPG: DataSource | null){
try{
const isGCP = isRunningInGCP();
    if (isGCP) {
      dbFirestore = await initializeFirestore(default_config!.firestore_database_id!); 
      console.log("Firestore initialized");
    }
    
    dbPG = await initializePgDB(default_config!);
    console.log("PostgreSQL initialized");
}catch(error){
  console.error("Failed to initialize databases:", error);
  process.exit(1);
}
}