import { Request, Response } from "express";
import { getAppState, isRunningInGCP } from "../../secrets/secrets_manager";
import { Firestore } from "@google-cloud/firestore";
import { DataSource } from "typeorm";
import {
  CurrencyHandlerUserStore,
  UserDataStore,
} from "../../datastore/datastore";

export const healthCheck = (store: CurrencyHandlerUserStore | null) => {
  return (req: Request, res: Response) => {
    const isGCP = isRunningInGCP();
    const dbStatus = isGCP
      ? store
        ? "connected"
        : "disconnected"
      : store
      ? "connected"
      : "disconnected";

    res.status(store ? 200 : 503).json({
      status: store ? "ready" : "initializing",
      database: dbStatus,
      environment: isGCP ? "GCP" : "local",
    });
  };
};
