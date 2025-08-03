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
exports.newCurrencyHandler = exports.CurrencyHandler = void 0;
const gcp_logger_1 = require("../../logger/gcp_logger");
class CurrencyHandler {
    constructor(forexApi, sendgrid, userStore, errorLog) {
        this.forexApi = forexApi;
        this.sendgrid = sendgrid;
        this.userStore = userStore;
        this.errorLog = errorLog;
        this.RATE_LIMIT_DELAY = 100; // ms between API calls
        this.listCurrencies = () => {
            return (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const currencies = yield this.forexApi.getSupportedCurrencies();
                    res.json({ message: "Currencies retrieved", currencies: currencies });
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    (0, gcp_logger_1.LogError)("Error getting currencies:", message);
                    res
                        .status(500)
                        .json({ message: "Error getting currencies", error: message });
                }
            });
        };
        this.convertCurrency = () => {
            return (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const request = req.query;
                    const response = yield this.forexApi.convertCurrency(request.from, request.to, request.amount, request.date);
                    const result = this.forexApi.formatCurrency(response.result);
                    res.json({
                        message: "Currency converted",
                        result: result,
                        success: true,
                    });
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    (0, gcp_logger_1.LogError)("Error converting currency:", message);
                    res
                        .status(500)
                        .json({ message: "Error converting currency", error: message });
                }
            });
        };
        this.getLiveRates = () => {
            return (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const request = req.query;
                    const response = yield this.forexApi.getLiveRates(request.base, request.currencies);
                    if (request.email) {
                        //check email is verified
                        const user = yield this.userStore.getUser(request.email);
                        if (!user || !user.isVerified) {
                            res
                                .status(400)
                                .json({ message: "Email not verified", success: false });
                            return;
                        }
                        yield this.sendgrid.sendFxRateEmail(response, request.email);
                        res.json({ message: "Live rates sent to mail", success: true });
                    }
                    else {
                        res.json({
                            message: "Live rates retrieved",
                            rates: response.rates,
                            success: true,
                        });
                    }
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    (0, gcp_logger_1.LogError)("Error getting live rates:", message);
                    res
                        .status(500)
                        .json({ message: "Error getting live rates", error: message });
                }
            });
        };
        this.ratesScheduler = () => {
            return (req, res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Get all verified users
                    const verifiedUsers = yield this.userStore.getVerifiedUsers();
                    if (verifiedUsers.length === 0) {
                        res.json({
                            message: "No verified users found",
                            success: true,
                            processedUsers: 0,
                        });
                        return;
                    }
                    const groupedusers = this.userStore.groupUsersByCurrency(verifiedUsers);
                    yield this.prefetchRates(groupedusers, req.body.operation);
                    let processedCount = 0;
                    let errorCount = 0;
                    const errors = [];
                    // Process users concurrently
                    const promises = verifiedUsers.map((user) => this.processUser(user));
                    const results = yield Promise.allSettled(promises);
                    results.forEach((promiseResult, index) => {
                        const user = verifiedUsers[index];
                        if (promiseResult.status === "fulfilled") {
                            if (promiseResult.value.success) {
                                processedCount++;
                            }
                            if (promiseResult.value.errorMsg) {
                                errors.push(promiseResult.value.errorMsg);
                                errorCount++;
                            }
                        }
                    });
                    // Log summary with all errors as array
                    if (errorCount > 0) {
                        const errorLogs = {
                            operation: req.body.operation,
                            id: uuidv4(),
                            date: new Date(),
                            errorMessage: errors.join(" | "),
                            createdAt: new Date(),
                        };
                        this.errorLog.saveError(errorLogs);
                        (0, gcp_logger_1.LogError)(`Rates scheduler completed with ${errorCount}`, "ratesScheduler");
                    }
                    else {
                        (0, gcp_logger_1.LogInfo)(`Rates scheduler completed: ${processedCount} users processed successfully`, "ratesScheduler");
                    }
                    res.status(200).json({
                        message: "Rates scheduler completed",
                        success: true,
                        processedUsers: processedCount,
                        errorCount: errorCount,
                    });
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    (0, gcp_logger_1.LogError)("Error in rates scheduler:", message);
                    res.status(500).json({
                        message: "Error in rates scheduler",
                        error: message,
                        success: false,
                    });
                }
            });
        };
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    prefetchRates(currencyGroups, operation) {
        return __awaiter(this, void 0, void 0, function* () {
            const uniquePairs = Array.from(currencyGroups.keys());
            (0, gcp_logger_1.LogInfo)(`Pre-fetching rates for ${uniquePairs.length} unique currency pairs`, operation);
            for (const pair of uniquePairs) {
                try {
                    const [baseCurrency, targetCurrencies] = pair.split("_");
                    const targets = targetCurrencies.split(",");
                    const rates = yield this.forexApi.getLiveRates(baseCurrency, targets);
                    yield this.delay(this.RATE_LIMIT_DELAY);
                }
                catch (error) {
                    (0, gcp_logger_1.LogError)(`Failed to fetch rates for ${pair}: ${error}`, operation);
                }
            }
        });
    }
    // processUser
    processUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user has base and target currencies
            if (!user.baseCurrency ||
                !user.targetCurrency ||
                user.targetCurrency.length === 0) {
                return {
                    success: false,
                    errorMsg: `User ${user.email} missing currency preferences`,
                };
            }
            // Get live rates for user's currency preferences
            // The getLiveRates method already handles Redis caching
            try {
                const response = yield this.forexApi.getLiveRates(user.baseCurrency, user.targetCurrency);
                // Send email to user
                yield this.sendgrid.sendFxRateEmail(response, user.email);
                return { success: true };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                return { success: false, errorMsg: errorMessage };
            }
        });
    }
}
exports.CurrencyHandler = CurrencyHandler;
const newCurrencyHandler = (forexApi, sendgrid, userStore, errorLog) => {
    return new CurrencyHandler(forexApi, sendgrid, userStore, errorLog);
};
exports.newCurrencyHandler = newCurrencyHandler;
function uuidv4() {
    throw new Error("Function not implemented.");
}
