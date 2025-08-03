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
exports.initializeFirestore = initializeFirestore;
exports.getFirestoreDB = getFirestoreDB;
const admin = __importStar(require("firebase-admin"));
const serviceAccount = __importStar(require("../../../service-account-key.json"));
const secrets_manager_1 = require("../../secrets/secrets_manager");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
let db = null;
function initializeFirestore(databaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Initializing Firestore with database: ${databaseId || '(default)'}`);
            console.log(`Project ID: ${secrets_manager_1.default_config.projectId || serviceAccount.project_id}`);
            if (!(0, app_1.getApps)().length) {
                console.log('Initializing Firebase Admin App...');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: secrets_manager_1.default_config.projectId || serviceAccount.project_id,
                    storageBucket: secrets_manager_1.default_config.firebase_storage_bucket
                });
                console.log('Firebase Admin App initialized');
            }
            console.log('Getting Firestore instance...');
            const app = admin.app();
            db = (0, firestore_1.getFirestore)(app, databaseId || '(default)');
            console.log('Testing Firestore connection...');
            const testCollection = db.collection('_connection_test');
            yield testCollection.limit(1).get();
            console.log('Firestore connection successful');
            return db;
        }
        catch (error) {
            console.error('Firestore initialization failed:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'Unknown stack'
            });
            // Reset db on failure
            db = null;
            throw new Error(`Firestore initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
}
function getFirestoreDB() {
    if (!db) {
        throw new Error("Firestore not initialized. Call initializeFirestore() first.");
    }
    return db;
}
