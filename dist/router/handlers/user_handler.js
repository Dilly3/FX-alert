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
const google_cloud_logger_1 = require("../../logger/google.cloud.logger");
class UserHandler {
    constructor(userStore, sendgrid) {
        this.userStore = userStore;
        this.sendgrid = sendgrid;
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = {
                    id: (0, uuid_1.v4)(),
                    email: req.body.email,
                    baseCurrency: req.body.baseCurrency,
                    targetCurrency: req.body.targetCurrency,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    pinExpiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    verificationPin: this.userStore.generatePin(),
                    isVerified: false,
                };
                const result = yield this.userStore.saveUser(user);
                // Send verification email
                yield this.sendgrid.sendPinVerificationEmail({ pin: user.verificationPin, email: user.email, expiryTime: user.pinExpiryTime.toISOString() }, user.email);
                res.status(201).json({ message: 'User created, check your email for verification', user: result, success: true });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                (0, google_cloud_logger_1.LogError)('Error creating user:', message);
                res.status(500).json({ message: 'Error creating user', error: message });
            }
        });
        this.verifyUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userStore.getUser(req.body.email);
                if (!user) {
                    return res.status(404).json({ message: 'User not found', success: false });
                }
                if (!this.userStore.validatePin(req.body.pin, user)) {
                    return res.status(401).json({ message: 'Invalid pin', success: false });
                }
                yield this.userStore.verifyUser(user.email);
                res.status(200).json({ message: 'User verified', success: true });
            }
            catch (error) {
            }
        });
    }
}
exports.UserHandler = UserHandler;
const newUserHandler = (userStore, sendgrid) => {
    return new UserHandler(userStore, sendgrid);
};
exports.newUserHandler = newUserHandler;
