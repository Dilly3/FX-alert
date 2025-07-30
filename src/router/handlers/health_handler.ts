import { Request, Response } from "express";
import { isRunningInGCP } from "../../secrets/secrets_manager";
import { Firestore } from "@google-cloud/firestore";
import { DataSource } from "typeorm";

export const healthCheck = (dbFirestore: Firestore | null, dbPG: DataSource | null, isAppReady: boolean) => {
return (req: Request, res: Response) => {
  const isGCP = isRunningInGCP();
  const dbStatus = isGCP 
    ? (dbFirestore ? 'connected' : 'disconnected')
    : (dbPG ? 'connected' : 'disconnected');
    
  res.status(isAppReady ? 200 : 503).json({ 
    status: isAppReady ? 'ready' : 'initializing',
    database: dbStatus,
    environment: isGCP ? 'GCP' : 'local'
  });
}
}