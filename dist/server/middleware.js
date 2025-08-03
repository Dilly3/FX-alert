"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiting = RateLimiting;
exports.LogIP = LogIP;
exports.RateLimitingEmail = RateLimitingEmail;
exports.ensureAppReady = ensureAppReady;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function RateLimiting(secrets) {
    return (0, express_rate_limit_1.default)({
        windowMs: secrets.rate_limit_window * 1000,
        max: secrets.rate_limit_max,
        message: `too many requests, try again in ${secrets.rate_limit_window} secs.`,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.log(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
            res.status(429).json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Try again in ${secrets.rate_limit_window} seconds.`,
                retryAfter: Math.ceil(secrets.rate_limit_window)
            });
        }
    });
}
function LogIP() {
    return (req, res, next) => {
        console.log('Client IP:', req.ip);
        next();
    };
}
function RateLimitingEmail(secrets) {
    const isDev = process.env.NODE_ENV === 'dev' || secrets.env === 'dev';
    const windowMs = isDev ? 60 * 1000 : 15 * 60 * 1000;
    const maxRequests = 3;
    return (0, express_rate_limit_1.default)({
        windowMs: windowMs,
        max: maxRequests,
        message: `Email rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.log(`Email rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
            res.status(429).json({
                error: 'limit exceeded',
                message: `Too many email requests. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
                retryAfter: Math.ceil(windowMs / 1000),
            });
        }
    });
}
function ensureAppReady(appState) {
    return (req, res, next) => {
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
        }
        catch (error) {
            console.error('Error in ensureAppReady middleware:', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: 'Internal server error'
            });
        }
    };
}
