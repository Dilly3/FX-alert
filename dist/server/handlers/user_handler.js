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
exports.newUserHandler = exports.UserHandler = void 0;
const uuid_1 = require("uuid");
const gcp_logger_1 = require("../../logger/gcp_logger");
class UserHandler {
    constructor(userStore, sendgrid, secrets) {
        this.userStore = userStore;
        this.sendgrid = sendgrid;
        this.secrets = secrets;
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // check if user already exists
                const existingUser = yield this.userStore.getUser(req.body.email);
                if (existingUser) {
                    return res
                        .status(400)
                        .json({ message: "User already exists", success: false });
                }
                // create user
                const pinExpiryDuration = 1000 * 60 * 60 * 24;
                const user = {
                    id: (0, uuid_1.v4)(),
                    email: req.body.email,
                    baseCurrency: req.body.baseCurrency,
                    targetCurrency: Array.isArray(req.body.targetCurrency)
                        ? req.body.targetCurrency
                        : [req.body.targetCurrency],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    pinExpiryTime: new Date(Date.now() + pinExpiryDuration),
                    verificationPin: this.userStore.generatePin(),
                    isVerified: false,
                };
                const pinVerificationEmailData = {
                    pin: user.verificationPin,
                    email: user.email,
                    expiryTime: user.pinExpiryTime.toUTCString(),
                    baseUrl: this.secrets.base_url,
                };
                yield this.sendgrid.sendPinVerificationEmail(pinVerificationEmailData, user.email);
                const result = yield this.userStore.saveUser(user);
                // Send verification email
                const userDto = {
                    email: result.email,
                    baseCurrency: result.baseCurrency,
                    targetCurrency: result.targetCurrency,
                    pinExpiryTime: pinVerificationEmailData.expiryTime,
                    isVerified: result.isVerified,
                };
                res
                    .status(201)
                    .json({
                    message: "User created, check your email for verification",
                    user: userDto,
                    success: true,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                (0, gcp_logger_1.LogError)("Error creating user:", message);
                res.status(500).json({ message: "Error creating user", error: message });
            }
        });
        this.verifyUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userStore.getUser(req.query.email);
                if (!user) {
                    return res
                        .status(404)
                        .json({ message: "User not found", success: false });
                }
                if (user.isVerified) {
                    return res
                        .status(400)
                        .json({ message: "User already verified", success: false });
                }
                if (!this.userStore.validatePin(req.query.pin, user)) {
                    return res.status(401).json({ message: "Invalid pin", success: false });
                }
                yield this.userStore.verifyUser(user.email);
                res.status(200).json({ message: "User verified", success: true });
            }
            catch (error) { }
        });
    }
}
exports.UserHandler = UserHandler;
const newUserHandler = (userStore, sendgrid, secrets) => {
    return new UserHandler(userStore, sendgrid, secrets);
};
exports.newUserHandler = newUserHandler;
