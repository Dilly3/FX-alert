import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as dotenv from 'dotenv';

export let default_config:config | null = null

export type config = {
    env: string
    host: string
    port: number
    username: string
    password: string
    database: string
    ssl: boolean
    projectId: string
sendgrid_api_key : string
sendgrid_sender_email : string
sendgrid_email_subject : string
firebase_storage_bucket : string
firestore_database_id : string
forex_api_key : string
}

async function getSecret(secretName: string): Promise<string> {
  try {
    const client = new SecretManagerServiceClient();
    dotenv.config({path: '../../.env_cloud'})
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
    }
    
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });

    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.error(`Failed to fetch secret '${secretName}':`, error);
    throw error;
  }
}

export async function loadGCPSecrets(): Promise<config> {
  const dbPassword = await getSecret('database_password');
  const dbUser = await getSecret('database_user');
  const dbName = await getSecret('database_name');
  const dbHost = await getSecret('database_host');
  const dbPort = await getSecret('database_port');
  const projectId = await getSecret('fx_alert_project_id');
  const sendgridApiKey = await getSecret('sendgrid_api_key');
  const sendgridSenderEmail = await getSecret('sendgrid_sender_email');
  const firebaseStorageBucket = await getSecret('firebase_storage_bucket');
  const sendgridEmailSubject = await getSecret('sendgrid_email_subject');
  const forexApiKey = await getSecret('forex_api_key');
  const firestoreDatabaseId = await getSecret('database_id');
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
    firestore_database_id: firestoreDatabaseId
  }
  default_config = config
  return config
}

export async function loadENVSecrets():Promise<config>{
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
    firestore_database_id: ""
  }
  default_config = config
  return config
}

export function isRunningInGCP(): boolean {
  return process.env.ENV === 'prod' || process.env.ENV === 'sandbox'
}

export async function loadSecrets():Promise<config>{
  // if running in GCP, use GCP secrets; otherwise use env vars
  if(isRunningInGCP()){
    return await loadGCPSecrets()
  }else{
    return await loadENVSecrets()
  }
}
