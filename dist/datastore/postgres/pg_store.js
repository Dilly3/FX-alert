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
exports.getDB = getDB;
exports.initializePgDB = initializePgDB;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const model_1 = require("../../model/model");
let db_instance = null;
function getDB() {
    if (db_instance === null) {
        console.log("Database not initialized");
        throw new Error("Database not initialized");
    }
    return db_instance;
}
function initializePgDB(config) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("initializing db");
        console.log("config object", config);
        const AppDataSource = new typeorm_1.DataSource({
            type: "postgres",
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            // SSL configuration for Cloud SQL
            ssl: false,
            // Connection pool settings
            extra: {
                max: 5,
                min: 1,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 30000,
            },
            synchronize: true,
            logging: ["query", "error", "warn", "info"],
            entities: [model_1.UserInfo, model_1.CurrencyRate, model_1.Currency]
        });
        try {
            yield AppDataSource.initialize();
            console.log("DB initialized!");
            db_instance = AppDataSource;
            return db_instance;
        }
        catch (error) {
            console.log("Database initialization failed:", error);
            throw error;
        }
    });
}
