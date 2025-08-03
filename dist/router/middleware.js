"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiting = RateLimiting;
exports.ensureAppReady = ensureAppReady;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function RateLimiting(secrets) {
    return (0, express_rate_limit_1.default)({
        windowMs: secrets.rate_limit_window * 1000,
        max: secrets.rate_limit_max,
        message: `too many requests, try again in ${secrets.rate_limit_window} secs.`
    });
}
function ensureAppReady(appState) {
    return (req, res, next) => {
        if (!appState.isAppReady) {
            // if app is not ready, return a 503 error
            return res.status(503).json({
                message: 'system initializing , try again in 60 secs',
                error: 'Service temporarily unavailable'
            });
        }
        next();
    };
}
