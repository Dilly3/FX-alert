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
exports.initializeApplication = initializeApplication;
const secrets_manager_1 = require("../secrets/secrets_manager");
const secrets_manager_2 = require("../secrets/secrets_manager");
const store_1 = require("../datastore/firestore/store");
const pg_store_1 = require("../datastore/postgres/pg_store");
const gcp_logger_1 = require("../logger/gcp_logger");
const datastore_1 = require("../datastore/datastore");
const forex_api_1 = require("../fx/forex_api/forex_api");
const sendgrid_1 = require("../mailer/sendgrid/sendgrid");
const redis_1 = require("../datastore/redis/redis");
function initializeApplication() {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = {
            dbFirestore: null,
            dbPG: null,
            userStore: null,
            currencyStore: null,
            forexApi: null,
            sendgrid: null,
            errorLog: null,
            isAppReady: false,
            redis: null
        };
        try {
            console.log("Loading secrets...");
            const secrets = yield (0, secrets_manager_1.loadSecrets)();
            console.log("Secrets loaded");
            console.log("Initializing databases...");
            const isGCP = (0, secrets_manager_2.isRunningInGCP)();
            if (isGCP) {
                console.log("Running in GCP, initializing Firestore...");
                try {
                    appState.dbFirestore = yield (0, store_1.initializeFirestore)('fx-alert-db');
                    console.log("Firestore initialized successfully");
                }
                catch (error) {
                    (0, gcp_logger_1.LogError)("Firestore initialization failed:", error);
                    throw new Error(`Firestore initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            else {
                console.log("Running locally, initializing PostgreSQL...");
                try {
                    appState.dbPG = yield (0, pg_store_1.initializePgDB)(secrets);
                    console.log("PostgreSQL initialized successfully");
                }
                catch (error) {
                    (0, gcp_logger_1.LogError)("PostgreSQL initialization failed:", error);
                    throw new Error(`PostgreSQL initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            (0, gcp_logger_1.LogInfo)("Initializing stores...", {});
            appState.userStore = (0, datastore_1.getUserStore)(appState.dbPG, appState.dbFirestore);
            appState.currencyStore = (0, datastore_1.getCurrencyDataStore)(appState.dbPG, appState.dbFirestore);
            appState.errorLog = (0, datastore_1.getErrorLogStore)(appState.dbPG, appState.dbFirestore);
            // Initialize Redis client first
            appState.redis = new redis_1.RedisClient(secrets.redis_host, secrets.redis_port, secrets.redis_password, secrets.redis_username, secrets.redis_ttl_hr);
            // Then initialize ForexApi with Redis client
            appState.forexApi = new forex_api_1.ForexApi(secrets.forex_api_key, appState.currencyStore, appState.redis);
            appState.sendgrid = new sendgrid_1.SendGrid(secrets);
            (0, gcp_logger_1.LogInfo)("Stores initialized successfully", {});
            appState.isAppReady = true;
            (0, gcp_logger_1.LogInfo)("All systems initialized and ready!", {});
            return { appState, secrets };
        }
        catch (error) {
            (0, gcp_logger_1.LogError)("app initialization failed:", error);
            process.exit(1);
        }
    });
}
