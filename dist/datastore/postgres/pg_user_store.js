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
exports.PgUserStore = void 0;
const model_1 = require("../../model/model");
class PgUserStore {
    constructor(db) {
        this.db = db;
        this.userRepository = this.db.getRepository(model_1.UserInfo);
    }
    firstOrCreate(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Use upsert with email as conflict path
                yield this.userRepository.upsert(user, {
                    conflictPaths: ["email"],
                    skipUpdateIfNoValuesChanged: true, // Performance optimization
                });
                // Return the actual entity
                const result = yield this.userRepository.findOne({
                    where: { email: user.email },
                });
                if (!result) {
                    throw new Error(`Failed to create or find user with email: ${user.email}`);
                }
                return result;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to firstOrCreate user: ${message}`);
            }
        });
    }
    generatePin() {
        // Generate a 6 digit pin
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    updatePin(email, pin) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateResult = yield this.userRepository.update({ email }, {
                    verificationPin: pin,
                    updatedAt: new Date(),
                });
                if (updateResult.affected === 0) {
                    throw new Error(`User with email ${email} not found`);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to update pin for user ${email}: ${message}`);
            }
        });
    }
    getVerificationPin(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findOne({
                    where: { email },
                    select: ["verificationPin"], // Only select the pin field
                });
                if (!user) {
                    throw new Error(`User with email ${email} not found`);
                }
                if (!user.verificationPin) {
                    throw new Error(`No verification pin found for user ${email}`);
                }
                return user.verificationPin;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to get verification pin for user ${email}: ${message}`);
            }
        });
    }
    validatePin(pin, user) {
        if (pin !== user.verificationPin) {
            return false;
        }
        if (user.pinExpiryTime < new Date()) {
            return false;
        }
        return true;
    }
    verifyUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateResult = yield this.userRepository.update({ email }, {
                    isVerified: true,
                    verificationPin: "",
                    updatedAt: new Date(),
                });
                if (updateResult.affected === 0) {
                    throw new Error(`User with email ${email} not found`);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to verify user ${email}: ${message}`);
            }
        });
    }
    saveUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userRepository.save(user);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to save user: ${message}`);
            }
        });
    }
    getUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userRepository.findOne({
                    where: { email },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to get user with email ${email}: ${message}`);
            }
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateResult = yield this.userRepository.update({ id: user.id }, Object.assign(Object.assign({}, user), { updatedAt: new Date() }));
                if (updateResult.affected === 0) {
                    throw new Error(`User with id ${user.id} not found`);
                }
                const updatedUser = yield this.userRepository.findOne({
                    where: { id: user.id },
                });
                if (!updatedUser) {
                    throw new Error(`Failed to retrieve updated user with id: ${user.id}`);
                }
                return updatedUser;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to update user: ${message}`);
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleteResult = yield this.userRepository.delete({ id });
                if (deleteResult.affected === 0) {
                    throw new Error(`User with id ${id} not found`);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to delete user with id ${id}: ${message}`);
            }
        });
    }
    // Additional helper methods
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userRepository.findOne({
                    where: { email },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to get user by email ${email}: ${message}`);
            }
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userRepository.find({
                    order: { createdAt: "DESC" },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to get all users: ${message}`);
            }
        });
    }
    getVerifiedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userRepository.find({
                    where: { isVerified: true },
                    order: { createdAt: "DESC" },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "unknown error";
                throw new Error(`failed to get users: ${message}`);
            }
        });
    }
    userExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield this.userRepository.count({
                    where: { email },
                });
                return count > 0;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to check if user exists: ${message}`);
            }
        });
    }
    groupUsersByCurrency(users) {
        const groups = new Map();
        users.forEach(user => {
            const key = Array.isArray(user.targetCurrency) ?
                `${user.baseCurrency}_${user.targetCurrency.sort().join(',')}` :
                `${user.baseCurrency}_${user.targetCurrency}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(user);
        });
        return groups;
    }
}
exports.PgUserStore = PgUserStore;
