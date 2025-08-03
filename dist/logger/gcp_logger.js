"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_SEVERITY = void 0;
exports.LogError = LogError;
exports.LogInfo = LogInfo;
exports.LogAlert = LogAlert;
// Imports the Google Cloud client library
const { Logging } = require('@google-cloud/logging');
// Log severity constants
exports.LOG_SEVERITY = {
    DEFAULT: 'DEFAULT',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    NOTICE: 'NOTICE',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL',
    ALERT: 'ALERT',
    EMERGENCY: 'EMERGENCY'
};
function log(type, message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Creates a client
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        const logName = 'FX-alert';
        const logging = new Logging({ projectId });
        const log = logging.log(logName);
        // The metadata associated with the entry
        const metadata = {
            resource: { type: 'global' },
            severity: type,
            timestamp: new Date().toISOString(),
        };
        // Prepares a log entry
        const entry = log.entry(metadata, data);
        function writeLog() {
            return __awaiter(this, void 0, void 0, function* () {
                yield log.write(entry);
                const timestamp = new Date().toLocaleString();
                console.log(`[${timestamp}]:${type}:${message}:`, JSON.stringify(data, null, 2));
            });
        }
        writeLog();
    });
}
// LOG ERROR
function LogError(message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield log(exports.LOG_SEVERITY.ERROR, message, data);
    });
}
// LOG INFO
function LogInfo(message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield log(exports.LOG_SEVERITY.INFO, message, data);
    });
}
// LOG ALERT
function LogAlert(message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield log(exports.LOG_SEVERITY.ALERT, message, data);
    });
}
