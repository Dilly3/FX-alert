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
}

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretManagerServiceClient();
  dotenv.config({path: '../../.env_cloud'})
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });

  return version.payload?.data?.toString() || '';
}

export async function loadSecrets(): Promise<config> {
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
    sendgrid_email_subject: sendgridEmailSubject 
  }
  default_config = config
  return config
}