import { RequestHandler } from 'express';
import { NextFunction, Request, Response } from "express";
import { AppState } from "./app";
import { config } from "../secrets/secrets_manager";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export function RateLimiting(secrets: config): RateLimitRequestHandler {
 if (!secrets) {
        throw new Error("secrets not initialized");
    }
  return rateLimit({
    windowMs: secrets!.rate_limit_window * 1000,
    max: secrets!.rate_limit_max, 
    message: `too many requests, try again in ${secrets!.rate_limit_window} secs.`,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => { 
      console.log(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${secrets!.rate_limit_window} seconds.`,
        retryAfter: Math.ceil(secrets!.rate_limit_window)
      });
    }
  });
}

export const LogIP: RequestHandler = (req, res, next) => {
  console.log('Client IP:', req.ip);
  next();
};

export function RateLimitingEmail(secrets: config): RateLimitRequestHandler {
  const isDev = process.env.NODE_ENV === 'dev' || secrets!.env === 'dev';
  const windowMs = isDev ? 60_000 : 900_000;
  const maxRequests = 3;
  const retryAfterSeconds = Math.ceil(windowMs / 1000);
  const errorMessage = `Email rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`;

  return rateLimit({
    windowMs,
    max: maxRequests,
    message: errorMessage,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`Email rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
      res.status(429).json({
        error: 'limit exceeded',
        message: errorMessage,
        retryAfter: retryAfterSeconds,
      });
    }
  });
}


export function ensureAppReady(appState: AppState): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`Middleware check - App ready: ${appState.isAppReady}, Path: ${req.path}, Method: ${req.method}`);
      
      if (!appState.isAppReady) {
        console.log('App not ready, returning 503');
        return res.status(503).json({
          message: 'System initializing, try again in 60 secs',
          error: 'Service temporarily unavailable',
          status: 'initializing'
        });
      }
      
      console.log(`Middleware passed for path: ${req.path}`);
      next();
    } catch (error) {
      console.error('Error in ensureAppReady middleware:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: 'Internal server error'
      });
    }
  };
};