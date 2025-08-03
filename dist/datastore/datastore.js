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
exports.getCurrencyDataStore = getCurrencyDataStore;
exports.getUserStore = getUserStore;
exports.getErrorLogStore = getErrorLogStore;
exports.initializeDatabases = initializeDatabases;
const currency_store_1 = require("./firestore/currency_store");
const pg_currency_store_1 = require("./postgres/pg_currency_store");
const pg_user_store_1 = require("./postgres/pg_user_store");
const user_store_1 = require("./firestore/user_store");
const secrets_manager_1 = require("../secrets/secrets_manager");
const pg_store_1 = require("./postgres/pg_store");
const store_1 = require("./firestore/store");
const error_log_1 = require("./firestore/error_log");
const pg_error_log_1 = require("./postgres/pg_error_log");
let currencyDataStore = null;
let userDataStore = null;
let errorLogStore = null;
function getCurrencyDataStore(dbpg, dbFirestore) {
    const isGCP = (0, secrets_manager_1.isRunningInGCP)();
    if (currencyDataStore) {
        return currencyDataStore;
    }
    if (isGCP) {
        if (!dbFirestore) {
            throw new Error("Firestore connection not available for GCP environment");
        }
        currencyDataStore = new currency_store_1.FirestoreCurrencyStore(dbFirestore);
    }
    else {
        if (!dbpg) {
            throw new Error("PostgreSQL connection not available for local environment");
        }
        currencyDataStore = new pg_currency_store_1.PgCurrencyStore(dbpg);
    }
    return currencyDataStore;
}
function getUserStore(dbpg, dbFirestore) {
    const isGCP = (0, secrets_manager_1.isRunningInGCP)();
    if (userDataStore) {
        return userDataStore;
    }
    if (isGCP) {
        if (!dbFirestore) {
            throw new Error("Firestore connection not available for GCP environment");
        }
        userDataStore = new user_store_1.FirestoreUserStore(dbFirestore);
    }
    else {
        if (!dbpg) {
            throw new Error("PostgreSQL connection not available for local environment");
        }
        userDataStore = new pg_user_store_1.PgUserStore(dbpg);
    }
    return userDataStore;
}
function getErrorLogStore(dbpg, dbFirestore) {
    const isGCP = (0, secrets_manager_1.isRunningInGCP)();
    if (errorLogStore) {
        return errorLogStore;
    }
    if (isGCP) {
        if (!dbFirestore) {
            throw new Error("Firestore connection not available for GCP environment");
        }
        errorLogStore = new error_log_1.FirestoreErrorLogStore(dbFirestore);
    }
    else {
        if (!dbpg) {
            throw new Error("PostgreSQL connection not available for local environment");
        }
        errorLogStore = new pg_error_log_1.pgErrorLogStore(dbpg);
    }
    return errorLogStore;
}
function initializeDatabases(dbFirestore, dbPG) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isGCP = (0, secrets_manager_1.isRunningInGCP)();
            if (isGCP) {
                dbFirestore = yield (0, store_1.initializeFirestore)(secrets_manager_1.default_config.firestore_database_id);
                console.log("Firestore initialized");
            }
            dbPG = yield (0, pg_store_1.initializePgDB)(secrets_manager_1.default_config);
            console.log("PostgreSQL initialized");
        }
        catch (error) {
            console.error("Failed to initialize databases:", error);
            process.exit(1);
        }
    });
}
