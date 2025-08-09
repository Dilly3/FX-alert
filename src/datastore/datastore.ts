import { Firestore } from "@google-cloud/firestore";
import { Currency, UserInfo, ErrorLog } from "../model/model";
import { FirestoreCurrencyStore } from "./firestore/currency_store";
import { PgCurrencyStore } from "./postgres/pg_currency_store";
import { DataSource } from "typeorm";
import { PgUserStore } from "./postgres/pg_user_store";
import { FirestoreUserStore } from "./firestore/user_store";
import { default_config, isRunningInGCP } from "../secrets/secrets_manager";
import { initializePgDB } from "./postgres/pg_store";
import { initializeFirestore } from "./firestore/store";
import { FirestoreErrorLogStore } from "./firestore/error_log";
import { pgErrorLogStore } from "./postgres/pg_error_log";
import {
  ConvertCurrencyRequest,
  ConvertCurrencyResponse,
  LiveRatesRequest,
  LiveRatesResponse,
} from "../model/dtos";

export interface CurrencyDataStore {
  firstOrCreate(currency: Currency): Promise<Currency>;
  bulkUpsert(currencies: Currency[]): Promise<void>;
  getCurrency(code: string): Promise<Currency | null>;
  getAllCurrencies(): Promise<Currency[]>;
}

export interface UserDataStore {
  firstOrCreate(user: UserInfo): Promise<UserInfo>;
  updatePin(email: string, pin: string): Promise<void>;
  getVerificationPin(email: string): Promise<string>;
  verifyUser(email: string): Promise<void>;
  saveUser(user: UserInfo): Promise<UserInfo>;
  getUser(email: string): Promise<UserInfo | null>;
  getVerifiedUsers(): Promise<UserInfo[]>;
  updateUser(user: UserInfo): Promise<UserInfo>;
  deleteUser(id: string): Promise<void>;
  validatePin(pin: string, user: UserInfo): boolean;
  groupUsersByCurrency(users: UserInfo[]): Map<string, any[]>;
  generatePin(): string;
}

export interface ICache {
  setCurrencyRate(
    request: LiveRatesRequest,
    value: LiveRatesResponse
  ): Promise<void>;
  getCurrencyRate(request: LiveRatesRequest): Promise<LiveRatesResponse | null>;
  setConvertCurrency(
    request: ConvertCurrencyRequest,
    value: ConvertCurrencyResponse
  ): Promise<void>;
  getConvertCurrency(
    request: ConvertCurrencyRequest
  ): Promise<ConvertCurrencyResponse | null>;
}

export interface ErrorLogStore {
  saveError(error: ErrorLog): Promise<void>;
}

let currencyDataStore: CurrencyDataStore | null = null;
let userDataStore: UserDataStore | null = null;
let errorLogStore: ErrorLogStore | null = null;

export function getCurrencyDataStore(
  dbpg: DataSource | null,
  dbFirestore: Firestore | null
): CurrencyDataStore {
  const isGCP = isRunningInGCP();
  if (currencyDataStore) {
    return currencyDataStore;
  }
  if (isGCP) {
    if (!dbFirestore) {
      throw new Error("Firestore connection not available for GCP environment");
    }
    currencyDataStore = new FirestoreCurrencyStore(dbFirestore);
  } else {
    if (!dbpg) {
      throw new Error(
        "PostgreSQL connection not available for local environment"
      );
    }
    currencyDataStore = new PgCurrencyStore(dbpg);
  }
  return currencyDataStore;
}

export function getUserStore(
  dbpg: DataSource | null,
  dbFirestore: Firestore | null
): UserDataStore {
  const isGCP = isRunningInGCP();
  if (userDataStore) {
    return userDataStore;
  }
  if (isGCP) {
    if (!dbFirestore) {
      throw new Error("Firestore connection not available for GCP environment");
    }
    userDataStore = new FirestoreUserStore(dbFirestore);
  } else {
    if (!dbpg) {
      throw new Error(
        "PostgreSQL connection not available for local environment"
      );
    }
    userDataStore = new PgUserStore(dbpg);
  }
  return userDataStore;
}

export function getErrorLogStore(
  dbpg: DataSource | null,
  dbFirestore: Firestore | null
): ErrorLogStore {
  const isGCP = isRunningInGCP();
  if (errorLogStore) {
    return errorLogStore;
  }
  if (isGCP) {
    if (!dbFirestore) {
      throw new Error("Firestore connection not available for GCP environment");
    }
    errorLogStore = new FirestoreErrorLogStore(dbFirestore);
  } else {
    if (!dbpg) {
      throw new Error(
        "PostgreSQL connection not available for local environment"
      );
    }
    errorLogStore = new pgErrorLogStore(dbpg);
  }
  return errorLogStore;
}

export async function initializeDatabases(
  dbFirestore: Firestore | null,
  dbPG: DataSource | null
) {
  try {
    const isGCP = isRunningInGCP();
    if (isGCP) {
      dbFirestore = await initializeFirestore(
        default_config!.firestore_database_id!
      );
      console.log("Firestore initialized");
    }

    dbPG = await initializePgDB(default_config!);
    console.log("PostgreSQL initialized");
  } catch (error) {
    console.error("Failed to initialize databases:", error);
    process.exit(1);
  }
}
