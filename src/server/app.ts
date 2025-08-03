import { loadSecrets } from "../secrets/secrets_manager";
import { isRunningInGCP } from "../secrets/secrets_manager";
import { initializeFirestore } from "../datastore/firestore/store";
import { initializePgDB } from "../datastore/postgres/pg_store";
import { LogError, LogInfo } from "../logger/gcp_logger";
import { config } from "../secrets/secrets_manager";
import { Firestore } from "@google-cloud/firestore";
import { DataSource } from "typeorm";
import { CurrencyDataStore, ErrorLogStore,getCurrencyDataStore, UserDataStore, getUserStore, getErrorLogStore } from "../datastore/datastore";
import { ForexApi } from "../fx/forex_api/forex_api";
import { SendGrid } from "../mailer/sendgrid/sendgrid";
import { RedisClient } from "../datastore/redis/redis";

export interface AppState {
  dbFirestore: Firestore;
  dbPG: DataSource;
  userStore: UserDataStore;
  currencyStore: CurrencyDataStore;
  forexApi: ForexApi;
errorLog : ErrorLogStore;
  sendgrid: SendGrid;
  isAppReady: boolean;
  redis: RedisClient;
}


export async function initializeApplication() : Promise<{appState: AppState, secrets: config}> {

  const appState: AppState = {
    dbFirestore: null!,
    dbPG: null!,
    userStore: null!,
    currencyStore: null!,
    forexApi: null!,
    sendgrid: null!,
errorLog : null!,
    isAppReady: false,
    redis: null!
  };

  try {
    console.log("Loading secrets...");
    const secrets = await loadSecrets();
    console.log("Secrets loaded");

    console.log("Initializing databases...");
    const isGCP = isRunningInGCP();
    
    if (isGCP) {
      console.log("Running in GCP, initializing Firestore...");
      try {
        appState.dbFirestore = await initializeFirestore('fx-alert-db');
        console.log("Firestore initialized successfully");
      } catch (error) {
        LogError("Firestore initialization failed:", error);
        throw new Error(`Firestore initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log("Running locally, initializing PostgreSQL...");
      try {
        appState.dbPG = await initializePgDB(secrets!);
        console.log("PostgreSQL initialized successfully");
      } catch (error) {
        LogError("PostgreSQL initialization failed:", error);
        throw new Error(`PostgreSQL initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    LogInfo("Initializing stores...",{});

    appState.userStore = getUserStore(appState.dbPG, appState.dbFirestore);
    appState.currencyStore = getCurrencyDataStore(appState.dbPG, appState.dbFirestore);
appState.errorLog = getErrorLogStore(appState.dbPG, appState.dbFirestore)
    
    // Initialize Redis client first
    appState.redis = new RedisClient(secrets!.redis_host, secrets!.redis_port, secrets!.redis_password, secrets!.redis_username, secrets!.redis_ttl_hr);
    
    // Then initialize ForexApi with Redis client
    appState.forexApi = new ForexApi(secrets!.forex_api_key, appState.currencyStore!, appState.redis);
    appState.sendgrid = new SendGrid(secrets!);
    LogInfo("Stores initialized successfully",{});

    appState.isAppReady = true;
    LogInfo("All systems initialized and ready!",{});
    return {appState, secrets};

  } catch (error) {
    LogError("app initialization failed:", error);
    process.exit(1); 
  }
}



