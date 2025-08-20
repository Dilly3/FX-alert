// Imports the Google Cloud client library
import { Log, Logging } from "@google-cloud/logging";

let log_instance: Log | null = null;
function getLog(): Log {
  if (!log_instance) {
    log_instance = InitLog();
  }
  return log_instance;
}

// Log severity constants
export const LOG_SEVERITY = {
  DEFAULT: "DEFAULT",
  DEBUG: "DEBUG",
  INFO: "INFO",
  NOTICE: "NOTICE",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
  ALERT: "ALERT",
  EMERGENCY: "EMERGENCY",
} as const;

export type LogSeverity = (typeof LOG_SEVERITY)[keyof typeof LOG_SEVERITY];

export function InitLog(): Log {
  // Creates a client
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const logName = "fx-alert";
  const logging = new Logging({ projectId });

  log_instance = logging.log(logName);
  return log_instance;
}

async function log(type: LogSeverity, message: string, data: any) {
  // The metadata associated with the entry
  const metadata = {
    resource: { type: "global" },
    severity: type,
    timestamp: new Date().toISOString(),
  };
  // Prepares a log entry
  const entry = getLog().entry(metadata, data);
  async function writeLog() {
    await getLog().write(entry);
    const timestamp = new Date().toLocaleString();
    console.log(
      `[${timestamp}]:${type}:${message}:`,
      JSON.stringify(data, null, 2)
    );
  }
  writeLog();
}
// LOG ERROR
export async function LogError(message: string, data: any) {
  await log(LOG_SEVERITY.ERROR, message, data);
}
// LOG INFO
export async function LogInfo(message: string, data: any) {
  await log(LOG_SEVERITY.INFO, message, data);
}
// LOG ALERT
export async function LogAlert(message: string, data: any) {
  await log(LOG_SEVERITY.ALERT, message, data);
}
