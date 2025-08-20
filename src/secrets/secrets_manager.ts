import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import * as dotenv from "dotenv";

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

interface RedisConfig {
  host: string;
  password: string;
  username: string;
  port: number;
  ttl_hr: number;
}

interface SendGridConfig {
  key: string;
  email_subject: string;
  sender_email: string;
}

interface RateLimitingConfig {
  max: number;
  window: number;
}

interface MiscConfig {
  firebase_storage_bucket: string;
  forex_api_key: string;
  fx_alert_project_id: string;
  base_url: string;
}

export interface FxAlertSecrets {
  database: DatabaseConfig;
  redis: RedisConfig;
  sendgrid: SendGridConfig;
  rate_limiting: RateLimitingConfig;
  misc: MiscConfig;
}

export interface AppConfig {
  environment: string;
  projectId: string;
  secretsName: string;
  secrets: FxAlertSecrets;
}

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

function validateSecrets(secrets: any): asserts secrets is FxAlertSecrets {
  const requiredSections = [
    "database",
    "redis",
    "sendgrid",
    "misc",
    "rate_limiting",
  ];

  for (const section of requiredSections) {
    if (!secrets[section]) {
      throw new Error(
        `Missing required section in consolidated secrets: ${section}`
      );
    }
  }

  // Validate redis config
  const redisRequired = ["host", "password", "username", "port", "ttl_hr"];
  for (const field of redisRequired) {
    if (!secrets.redis[field]) {
      throw new Error(`Missing required redis field: ${field}`);
    }
  }

  // Validate sendgrid config
  const sendgridRequired = ["key", "email_subject", "sender_email"];
  for (const field of sendgridRequired) {
    if (!secrets.sendgrid[field]) {
      throw new Error(`Missing required sendgrid field: ${field}`);
    }
  }

  // Validate misc config
  const miscRequired = [
    "firebase_storage_bucket",
    "forex_api_key",
    "fx_alert_project_id",
    "base_url",
  ];
  for (const field of miscRequired) {
    if (!secrets.misc[field]) {
      throw new Error(`Missing required misc field: ${field}`);
    }
  }

  // Validate rate_limiting config
  const rateLimitingRequired = ["max", "window"];
  for (const field of rateLimitingRequired) {
    if (!secrets.rate_limiting[field]) {
      throw new Error(`Missing required rate_limiting field: ${field}`);
    }
  }

  console.log("Secret validation passed");
}

async function getSecret(secretName: string): Promise<FxAlertSecrets> {
  try {
    const client = new SecretManagerServiceClient({
      timeout: 10000, // 10 second timeout
    });
    dotenv.config({ path: "../../.env_cloud" });
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    if (!projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT environment variable is not set");
    }

    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });

    const secretValue = version.payload?.data?.toString();
    if (!secretValue) {
      throw new Error(`Secret '${secretName}' is empty or not found`);
    }
    const secrets: FxAlertSecrets = JSON.parse(secretValue);
    validateSecrets(secrets);
    await client.close();
    return secrets;
  } catch (error) {
    console.error(`Failed to fetch secret '${secretName}':`, error);
    throw error;
  }
}

export async function loadGCPSecrets(): Promise<config> {
  const secret_name = process.env.SECRETS_NAME || undefined;
  if (!secret_name) {
    throw new Error(`Secret '${secret_name}' is not defined`);
  }
  const secrets = await getSecret(secret_name);

  const env = process.env.ENV!;

  const config = {
    env: env,
    host: secrets.database.host,
    port: secrets.database.port,
    username: secrets.database.user,
    password: secrets.database.password,
    database: secrets.database.name,
    ssl: false,
    projectId: secrets.misc.fx_alert_project_id,
    sendgrid_api_key: secrets.sendgrid.key,
    sendgrid_sender_email: secrets.sendgrid.sender_email,
    firebase_storage_bucket: secrets.misc.firebase_storage_bucket,
    sendgrid_email_subject: secrets.sendgrid.email_subject,
    forex_api_key: secrets.misc.forex_api_key,
    firestore_database_id: secrets.misc.firebase_storage_bucket,
    rate_limit_max: secrets.rate_limiting.max,
    rate_limit_window: secrets.rate_limiting.window,
    base_url: secrets.misc.base_url,
    redis_host: secrets.redis.host,
    redis_port: secrets.redis.port,
    redis_password: secrets.redis.password,
    redis_username: secrets.redis.username,
    redis_ttl_hr: secrets.redis.ttl_hr,
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
