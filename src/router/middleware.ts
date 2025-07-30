import { NextFunction, Request, Response } from "express";
import { AppState } from "./app";
import { config } from "../secrets/secrets_manager";
import rateLimit from "express-rate-limit";
import type { RateLimitRequestHandler } from "express-rate-limit";


export function RateLimiting(secrets: config) : RateLimitRequestHandler {
  return rateLimit({
    windowMs: secrets!.rate_limit_window * 1000,
    max: secrets!.rate_limit_max, 
    message: `too many requests, try again in ${secrets!.rate_limit_window} secs.`
  });
}

export function ensureAppReady(appState: AppState) {
  return (req: Request, res: Response, next: NextFunction) => {
  if (!appState!.isAppReady) {
// if app is not ready, return a 503 error
    return res.status(503).json({
      message: 'system initializing , try again in 60 secs',
      error: 'Service temporarily unavailable'
    });
  }
  next();
};
}