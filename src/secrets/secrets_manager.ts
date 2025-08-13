import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import * as dotenv from "dotenv";

export let default_config: config | null = null;
let isAppReady: boolean = false;
export const getAppState = () => isAppReady;
export function setAppState(ready: boolean) {
  isAppReady = ready;
}

export type config = {
  env: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
  projectId?: string;
  sendgrid_api_key?: string;
  sendgrid_sender_email?: string;
  sendgrid_email_subject?: string;
  firebase_storage_bucket?: string;
  firestore_database_id?: string;
  forex_api_key?: string;
  rate_limit_max?: number;
  rate_limit_window?: number;
  base_url?: string;
  redis_host?: string;
  redis_port?: number;
  redis_password?: string;
  redis_username?: string;
  redis_ttl_hr?: number;
};

async function getSecret(secretName: string): Promise<string> {
  try {
    const client = new SecretManagerServiceClient({
      timeout: 10000, // 10 second timeout
    });
    dotenv.config({ path: "../../.env_cloud" });
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    if (projectId == null || projectId === "") {
      throw new Error("GOOGLE_CLOUD_PROJECT environment variable is not set");
    }

    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });

    const secretValue = version.payload?.data?.toString();
    if (secretValue == null || secretValue === "") {
      throw new Error(`Secret '${secretName}' is empty or not found`);
    }

    await client.close();
    return secretValue;
  } catch (error) {
    console.error(`Failed to fetch secret '${secretName}':`, error);
    throw error;
  }
}

export async function loadGCPSecrets(): Promise<config> {
  const [
    dbPassword,
    dbUser,
    dbName,
    dbHost,
    dbPort,
    projectId,
    sendgridApiKey,
    sendgridSenderEmail,
    firebaseStorageBucket,
    sendgridEmailSubject,
    forexApiKey,
    firestoreDatabaseId,
    rateLimitMax,
    rateLimitWindow,
    baseUrl,
    redisHost,
    redisPort,
    redisPassword,
    redisUsername,
    redisTtlHr,
  ] = await Promise.all([
    getSecret("database_password"),
    getSecret("database_user"),
    getSecret("database_name"),
    getSecret("database_host"),
    getSecret("database_port"),
    getSecret("fx_alert_project_id"),
    getSecret("sendgrid_api_key"),
    getSecret("sendgrid_sender_email"),
    getSecret("firebase_storage_bucket"),
    getSecret("sendgrid_email_subject"),
    getSecret("forex_api_key"),
    getSecret("database_id"),
    getSecret("rate_limit_max"),
    getSecret("rate_limit_window"),
    getSecret("base_url"),
    getSecret("redis_host"),
    getSecret("redis_port"),
    getSecret("redis_password"),
    getSecret("redis_username"),
    getSecret("redis_ttl_hr"),
  ]);

  const env = process.env.ENV!;

  const config = {
    env: env,
    host: dbHost,
    port: parseInt(dbPort),
    username: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: false,
    projectId: projectId,
    sendgrid_api_key: sendgridApiKey,
    sendgrid_sender_email: sendgridSenderEmail,
    firebase_storage_bucket: firebaseStorageBucket,
    sendgrid_email_subject: sendgridEmailSubject,
    forex_api_key: forexApiKey,
    firestore_database_id: firestoreDatabaseId,
    rate_limit_max: parseInt(rateLimitMax),
    rate_limit_window: parseInt(rateLimitWindow),
    base_url: baseUrl,
    redis_host: redisHost,
    redis_port: parseInt(redisPort),
    redis_password: redisPassword,
    redis_username: redisUsername,
    redis_ttl_hr: parseInt(redisTtlHr),
  };
  default_config = config;
  return config;
}

export async function loadENVSecrets(): Promise<config> {
  const dbPassword = process.env.DB_PASSWORD!;
  const dbUser = process.env.DB_USER!;
  const dbName = process.env.DB_NAME!;
  const dbHost = process.env.DB_HOST!;
  const dbPort = process.env.DB_PORT!;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT!;
  const sendgridApiKey = process.env.SENDGRID_API_KEY!;
  const sendgridSenderEmail = process.env.SENDGRID_SENDER_EMAIL!;
  const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET!;
  const sendgridEmailSubject = process.env.SENDGRID_EMAIL_SUBJECT!;
  const forexApiKey = process.env.FOREX_API_KEY!;
  const env = process.env.ENV!;
  const rateLimitMax = process.env.RATE_LIMIT_MAX!;
  const rateLimitWindow = process.env.RATE_LIMIT_WINDOW!;
  const baseUrl = process.env.BASE_URL!;
  const redisHost = process.env.REDIS_HOST!;
  const redisPort = process.env.REDIS_PORT!;
  const redisPassword = process.env.REDIS_PASSWORD!;
  const redisUsername = process.env.REDIS_USERNAME!;
  const redisTtlHr = process.env.REDIS_TTL_HR!;
  const config = {
    env: env,
    host: dbHost,
    port: parseInt(dbPort),
    username: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: false,
    projectId: projectId,
    sendgrid_api_key: sendgridApiKey,
    sendgrid_sender_email: sendgridSenderEmail,
    firebase_storage_bucket: firebaseStorageBucket,
    sendgrid_email_subject: sendgridEmailSubject,
    forex_api_key: forexApiKey,
    firestore_database_id: "",
    rate_limit_max: parseInt(rateLimitMax),
    rate_limit_window: parseInt(rateLimitWindow),
    base_url: baseUrl,
    redis_host: redisHost,
    redis_port: parseInt(redisPort),
    redis_password: redisPassword,
    redis_username: redisUsername,
    redis_ttl_hr: parseInt(redisTtlHr),
  };
  default_config = config;
  return config;
}

export function isRunningInGCP(): boolean {
  return process.env.ENV === "prod" || process.env.ENV === "sandbox";
}

export async function loadSecrets(): Promise<config> {
  // if running in GCP, use GCP secrets; otherwise use env vars
  if (isRunningInGCP()) {
    return await loadGCPSecrets();
  } else {
    return await loadENVSecrets();
  }
}

export enum environment {
  PRODUCTION = "prod",
  SANDBOX = "sandbox",
  DEVELOPMENT = "dev",
}
