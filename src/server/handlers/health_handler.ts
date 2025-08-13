import { Request, Response } from "express";
import { isRunningInGCP } from "../../secrets/secrets_manager";
import { CurrencyHandlerUserStore } from "../../datastore/datastore";

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
