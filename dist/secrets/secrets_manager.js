"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.default_config = void 0;
exports.loadGCPSecrets = loadGCPSecrets;
exports.loadENVSecrets = loadENVSecrets;
exports.isRunningInGCP = isRunningInGCP;
exports.loadSecrets = loadSecrets;
const secret_manager_1 = require("@google-cloud/secret-manager");
const dotenv = __importStar(require("dotenv"));
exports.default_config = null;
function getSecret(secretName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const client = new secret_manager_1.SecretManagerServiceClient({
                timeout: 10000, // 10 second timeout
            });
            dotenv.config({ path: '../../.env_cloud' });
            const projectId = process.env.GOOGLE_CLOUD_PROJECT;
            if (!projectId) {
                throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
            }
            const [version] = yield client.accessSecretVersion({
                name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
            });
            const secretValue = (_b = (_a = version.payload) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.toString();
            if (!secretValue) {
                throw new Error(`Secret '${secretName}' is empty or not found`);
            }
            yield client.close();
            return secretValue;
        }
        catch (error) {
            console.error(`Failed to fetch secret '${secretName}':`, error);
            throw error;
        }
    });
}
function loadGCPSecrets() {
    return __awaiter(this, void 0, void 0, function* () {
        const [dbPassword, dbUser, dbName, dbHost, dbPort, projectId, sendgridApiKey, sendgridSenderEmail, firebaseStorageBucket, sendgridEmailSubject, forexApiKey, firestoreDatabaseId, rateLimitMax, rateLimitWindow, baseUrl, redisHost, redisPort, redisPassword, redisUsername, redisTtlHr] = yield Promise.all([
            getSecret('database_password'),
            getSecret('database_user'),
            getSecret('database_name'),
            getSecret('database_host'),
            getSecret('database_port'),
            getSecret('fx_alert_project_id'),
            getSecret('sendgrid_api_key'),
            getSecret('sendgrid_sender_email'),
            getSecret('firebase_storage_bucket'),
            getSecret('sendgrid_email_subject'),
            getSecret('forex_api_key'),
            getSecret('database_id'),
            getSecret('rate_limit_max'),
            getSecret('rate_limit_window'),
            getSecret('base_url'),
            getSecret('redis_host'),
            getSecret('redis_port'),
            getSecret('redis_password'),
            getSecret('redis_username'),
            getSecret('redis_ttl_hr')
        ]);
        const env = process.env.ENV;
        const config = {
            env: env,
            host: dbHost,
            port: parseInt(dbPort),
            username: dbUser,
            password: dbPassword,
            database: dbName,
            ssl: false,
            projectId: projectId,
            sendgrid_api_key: sendgridApiKey,
            sendgrid_sender_email: sendgridSenderEmail,
            firebase_storage_bucket: firebaseStorageBucket,
            sendgrid_email_subject: sendgridEmailSubject,
            forex_api_key: forexApiKey,
            firestore_database_id: firestoreDatabaseId,
            rate_limit_max: parseInt(rateLimitMax),
            rate_limit_window: parseInt(rateLimitWindow),
            base_url: baseUrl,
            redis_host: redisHost,
            redis_port: parseInt(redisPort),
            redis_password: redisPassword,
            redis_username: redisUsername,
            redis_ttl_hr: parseInt(redisTtlHr)
        };
        exports.default_config = config;
        return config;
    });
}
function loadENVSecrets() {
    return __awaiter(this, void 0, void 0, function* () {
        const dbPassword = process.env.DB_PASSWORD;
        const dbUser = process.env.DB_USER;
        const dbName = process.env.DB_NAME;
        const dbHost = process.env.DB_HOST;
        const dbPort = process.env.DB_PORT;
        const projectId = process.env.GOOGLE_CLOUD_PROJECT;
        const sendgridApiKey = process.env.SENDGRID_API_KEY;
        const sendgridSenderEmail = process.env.SENDGRID_SENDER_EMAIL;
        const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
        const sendgridEmailSubject = process.env.SENDGRID_EMAIL_SUBJECT;
        const forexApiKey = process.env.FOREX_API_KEY;
        const env = process.env.ENV;
        const rateLimitMax = process.env.RATE_LIMIT_MAX;
        const rateLimitWindow = process.env.RATE_LIMIT_WINDOW;
        const baseUrl = process.env.BASE_URL;
        const redisHost = process.env.REDIS_HOST;
        const redisPort = process.env.REDIS_PORT;
        const redisPassword = process.env.REDIS_PASSWORD;
        const redisUsername = process.env.REDIS_USERNAME;
        const redisTtlHr = process.env.REDIS_TTL_HR;
        const config = {
            env: env,
            host: dbHost,
            port: parseInt(dbPort),
            username: dbUser,
            password: dbPassword,
            database: dbName,
            ssl: false,
            projectId: projectId,
            sendgrid_api_key: sendgridApiKey,
            sendgrid_sender_email: sendgridSenderEmail,
            firebase_storage_bucket: firebaseStorageBucket,
            sendgrid_email_subject: sendgridEmailSubject,
            forex_api_key: forexApiKey,
            firestore_database_id: "",
            rate_limit_max: parseInt(rateLimitMax),
            rate_limit_window: parseInt(rateLimitWindow),
            base_url: baseUrl,
            redis_host: redisHost,
            redis_port: parseInt(redisPort),
            redis_password: redisPassword,
            redis_username: redisUsername,
            redis_ttl_hr: parseInt(redisTtlHr)
        };
        exports.default_config = config;
        return config;
    });
}
function isRunningInGCP() {
    return process.env.ENV === 'prod' || process.env.ENV === 'sandbox';
}
function loadSecrets() {
    return __awaiter(this, void 0, void 0, function* () {
        // if running in GCP, use GCP secrets; otherwise use env vars
        if (isRunningInGCP()) {
            return yield loadGCPSecrets();
        }
        else {
            return yield loadENVSecrets();
        }
    });
}
