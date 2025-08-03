"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const secrets_manager_1 = require("../../secrets/secrets_manager");
const healthCheck = (dbFirestore, dbPG, isAppReady) => {
    return (req, res) => {
        const isGCP = (0, secrets_manager_1.isRunningInGCP)();
        const dbStatus = isGCP
            ? (dbFirestore ? 'connected' : 'disconnected')
            : (dbPG ? 'connected' : 'disconnected');
        res.status(isAppReady ? 200 : 503).json({
            status: isAppReady ? 'ready' : 'initializing',
            database: dbStatus,
            environment: isGCP ? 'GCP' : 'local'
        });
    };
};
exports.healthCheck = healthCheck;
