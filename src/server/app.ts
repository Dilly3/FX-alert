import { loadSecrets, setAppState } from "../secrets/secrets_manager";
import { isRunningInGCP } from "../secrets/secrets_manager";
import { initializeFirestore } from "../datastore/firestore/store";
import { initializePgDB } from "../datastore/postgres/pg_store";
import { LogError, LogInfo } from "../logger/gcp_logger";
import { config } from "../secrets/secrets_manager";
import { Firestore } from "@google-cloud/firestore";
import { DataSource } from "typeorm";
import {
  getCurrencyDataStore,
  getErrorLogStore,
  getUserStore,
} from "../datastore/datastore";
import { RedisClient } from "../datastore/redis/redis";
import { ForexApi } from "../fx/forex_api/forex_api";
import { SendGrid } from "../mailer/sendgrid/sendgrid";

export interface AppConfig {
  dbFirestore?: Firestore;
  dbPG?: DataSource;
  secrets?: config;
}

export async function initializeAppConfig(): Promise<AppConfig> {
  const appConfig: AppConfig = {
    dbFirestore: null!,
    dbPG: null!,
    secrets: null!,
  };

  try {
    console.log("Loading secrets...");
    appConfig.secrets = await loadSecrets();
    console.log("Secrets loaded");

    console.log("Initializing databases...");
    const isGCP = isRunningInGCP();

    if (isGCP) {
      console.log("Running in GCP, initializing Firestore...");
      try {
        appConfig.dbFirestore = await initializeFirestore("fx-alert-db");
        console.log("Firestore initialized successfully");
      } catch (error) {
        LogError("Firestore initialization failed:", error);
        throw new Error(
          `Firestore initialization failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } else {
      console.log("Running locally, initializing PostgreSQL...");
      try {
        appConfig.dbPG = await initializePgDB(appConfig!.secrets!);
        console.log("PostgreSQL initialized successfully");
      } catch (error) {
        LogError("PostgreSQL initialization failed:", error);
        throw new Error(
          `PostgreSQL initialization failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    LogInfo("app config setup successful!!", {});
    return appConfig;
  } catch (error) {
    LogError("app initialization failed:", error);
    throw error;
  }
}

export function initializeApp(config: AppConfig) {
  try {
    const userStore = getUserStore(config!.dbPG!, config!.dbFirestore!);
    const currencyStore = getCurrencyDataStore(
      config!.dbPG!,
      config!.dbFirestore!
    );
    const errorLog = getErrorLogStore(config!.dbPG!, config!.dbFirestore!);

    // // Initialize Redis client first
    const redis = new RedisClient(
      config!.secrets!.redis_host!,
      config!.secrets!.redis_port!,
      config!.secrets!.redis_password!,
      config!.secrets!.redis_username!,
      config!.secrets!.redis_ttl_hr!
    );
    // initialize ForexApi with Redis client
    const forexApi = new ForexApi(
      config!.secrets!.forex_api_key!,
      currencyStore,
      redis
    );
    const sendgrid = new SendGrid(config!.secrets!);
    LogInfo("Stores initialized successfully", {});
    setAppState(true);
    return {
      userStore,
      currencyStore,
      errorLog,
      forexApi,
      sendgrid,
    };
  } catch (error) {
    setAppState(false);
    LogError("Failed to initialize application:", error);
    throw new Error(
      `Failed to initialize application: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
