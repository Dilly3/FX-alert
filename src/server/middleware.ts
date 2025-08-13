import { RequestHandler } from "express";
import { NextFunction, Request, Response } from "express";
import { config, getAppState } from "../secrets/secrets_manager";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export function RateLimiting(secrets: config): RateLimitRequestHandler {
  const isTest =
    process.env.NODE_ENV === "test" ||
    (secrets != null ? secrets.env === "test" : false);
  // Return a pass-through middleware for test environment
  if (isTest) {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Infinity,
      handler: (req, res, next) => next(),
    });
  }
  return rateLimit({
    windowMs: secrets != null ? secrets.rate_limit_window! * 1000 : 60_000,
    max: secrets != null ? secrets.rate_limit_max : 10,
    message: `too many requests, try again in ${
      secrets != null ? secrets.rate_limit_window : 60
    } secs.`,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
      res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${
          secrets!.rate_limit_window
        } seconds.`,
        retryAfter: Math.ceil(secrets!.rate_limit_window!),
      });
    },
  });
}

export const LogIP: RequestHandler = (req, res, next) => {
  console.log("Client IP:", req.ip);
  next();
};

export function RateLimitingEmail(secrets: config): RequestHandler {
  const isTest =
    process.env.NODE_ENV === "test" ||
    (secrets != null ? secrets.env === "test" : false);
  // Return a pass-through middleware for test environment
  if (isTest) {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }
  const isDev =
    process.env.NODE_ENV === "dev" ||
    (secrets != null ? secrets.env === "dev" : true);
  const windowMs = isDev ? 60_000 : 12_00_000;
  const maxRequests = isDev ? 10 : 7;
  const retryAfterSeconds = Math.ceil(windowMs / 1000);
  const errorMessage = `Email rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`;

  // Use rateLimit for non-test environments
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: errorMessage,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(
        `Email rate limit exceeded for IP: ${req.ip} on path: ${req.path}`
      );
      res.status(429).json({
        error: "limit exceeded",
        message: errorMessage,
        retryAfter: retryAfterSeconds,
      });
    },
  });
}

export function ensureAppReady(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(
        `Middleware check - App ready: ${getAppState()}, Path: ${
          req.path
        }, Method: ${req.method}`
      );

      if (!getAppState()) {
        console.log("App not ready, returning 503");
        return res.status(503).json({
          message: "System initializing, try again in 60 secs",
          error: "Service temporarily unavailable",
          status: "initializing",
        });
      }

      console.log(`Middleware passed for path: ${req.path}`);
      next();
    } catch (error) {
      console.error("Error in ensureAppReady middleware:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  };
}
