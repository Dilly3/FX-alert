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
exports.RedisClient = void 0;
const redis_1 = require("redis");
const gcp_logger_1 = require("../../logger/gcp_logger");
class RedisClient {
    constructor(host, port, password, username, ttl) {
        const { client, CACHE_TTL, isUp } = this.connect(username, password, host, port, ttl);
        this.client = client;
        this.CACHE_TTL = CACHE_TTL;
        this.isUp = isUp;
    }
    connect(username, password, host, port, ttl) {
        let client = null;
        let isUp = false;
        let CACHE_TTL = 0;
        try {
            CACHE_TTL = ttl * 60 * 60 * 1000;
            client = (0, redis_1.createClient)({
                username: username,
                password: password,
                socket: {
                    host: host,
                    port: port,
                },
            });
            client.on("error", (error) => {
                (0, gcp_logger_1.LogError)("Redis connection error:", { error: error });
                isUp = false;
            });
            client.on("connect", () => {
                (0, gcp_logger_1.LogInfo)("Redis connected successfully", {});
                isUp = true;
            });
            client.on("close", () => {
                (0, gcp_logger_1.LogInfo)("Redis connection closed", {});
                isUp = false;
            });
            // Connect to Redis
            client
                .connect()
                .then(() => {
                (0, gcp_logger_1.LogInfo)("Redis connected successfully", {});
                isUp = true;
            })
                .catch((error) => {
                (0, gcp_logger_1.LogError)("Error connecting to Redis", error);
                isUp = false;
            });
            return { client, CACHE_TTL, isUp };
        }
        catch (error) {
            (0, gcp_logger_1.LogError)("Error connecting to Redis", error);
            throw error;
        }
    }
    setCurrencyRate(request, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = Array.isArray(request.currencies)
                ? `currency_rate_${request.base}_${request.currencies.sort().join(",")}`
                : `currency_rate_${request.base}_${request.currencies}`;
            yield this.set(cacheKey, value);
        });
    }
    getCurrencyRate(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = Array.isArray(request.currencies)
                ? `currency_rate_${request.base}_${request.currencies.sort().join(",")}`
                : `currency_rate_${request.base}_${request.currencies}`;
            return yield this.get(cacheKey);
        });
    }
    deleteCurrencyRate(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = Array.isArray(request.currencies)
                ? `currency_rate_${request.base}_${request.currencies.sort().join(",")}`
                : `currency_rate_${request.base}_${request.currencies}`;
            yield this.delete(cacheKey);
        });
    }
    setConvertCurrency(request, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `currency_rate_${request.from}_${request.to}_${request.amount}_${request.date}`;
            yield this.set(cacheKey, value);
        });
    }
    getConvertCurrency(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `currency_rate_${request.from}_${request.to}_${request.amount}_${request.date}`;
            return yield this.get(cacheKey);
        });
    }
    isConnected() {
        return this.isUp;
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.client.get(key);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch (error) {
                console.error("Failed to parse cached value:", error);
                return null;
            }
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Convert milliseconds to seconds
                const ttlSeconds = Math.floor(this.CACHE_TTL / 1000);
                yield this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
            }
            catch (error) {
                console.error("Failed to set cache value:", error);
                throw error;
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.del(key);
        });
    }
}
exports.RedisClient = RedisClient;
