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
exports.FirestoreUserStore = void 0;
const model_1 = require("../../model/model");
class FirestoreUserStore {
    constructor(db) {
        this.db = db;
        this.COLLECTION_NAME = model_1.collection.USER;
    }
    firstOrCreate(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists by email
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('email', '==', user.email)
                    .limit(1)
                    .get();
                if (!snapshot.empty) {
                    // User exists, return existing user
                    const doc = snapshot.docs[0];
                    const data = doc.data();
                    return Object.assign({ id: doc.id }, data);
                }
                // User doesn't exist, create new one
                // Convert pinExpiryTime to ISO string if it's a Date object
                const pinExpiryTime = user.pinExpiryTime instanceof Date
                    ? user.pinExpiryTime.toISOString()
                    : user.pinExpiryTime;
                const docRef = yield this.db.collection(this.COLLECTION_NAME).add(Object.assign(Object.assign({}, user), { pinExpiryTime: pinExpiryTime, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isVerified: false }));
                const newDoc = yield docRef.get();
                const newData = newDoc.data();
                return {
                    id: newDoc.id,
                    email: newData === null || newData === void 0 ? void 0 : newData.email,
                    baseCurrency: newData === null || newData === void 0 ? void 0 : newData.baseCurrency,
                    targetCurrency: newData === null || newData === void 0 ? void 0 : newData.targetCurrency,
                    pinExpiryTime: newData === null || newData === void 0 ? void 0 : newData.pinExpiryTime,
                    isVerified: newData === null || newData === void 0 ? void 0 : newData.isVerified,
                    verificationPin: newData === null || newData === void 0 ? void 0 : newData.verificationPin,
                    createdAt: newData === null || newData === void 0 ? void 0 : newData.createdAt,
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to firstOrCreate user: ${message}`);
            }
        });
    }
    updatePin(email, pin) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find user by email
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('email', '==', email)
                    .limit(1)
                    .get();
                if (snapshot.empty) {
                    throw new Error(`User with email ${email} not found`);
                }
                const doc = snapshot.docs[0];
                yield doc.ref.update({
                    verificationPin: pin,
                    pinGeneratedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to update pin for user ${email}: ${message}`);
            }
        });
    }
    getVerificationPin(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('email', '==', email)
                    .limit(1)
                    .get();
                if (snapshot.empty) {
                    throw new Error(`User with email ${email} not found`);
                }
                const doc = snapshot.docs[0];
                const data = doc.data();
                if (!(data === null || data === void 0 ? void 0 : data.verificationPin)) {
                    throw new Error(`No verification pin found for user ${email}`);
                }
                return data.verificationPin;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get verification pin for user ${email}: ${message}`);
            }
        });
    }
    verifyUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('email', '==', email)
                    .limit(1)
                    .get();
                if (snapshot.empty) {
                    throw new Error(`User with email ${email} not found`);
                }
                const doc = snapshot.docs[0];
                yield doc.ref.update({
                    isVerified: true,
                    verifiedAt: new Date().toISOString(),
                    verificationPin: null, // Clear the pin after verification
                    updatedAt: new Date().toISOString()
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to verify user ${email}: ${message}`);
            }
        });
    }
    saveUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Convert pinExpiryTime to ISO string if it's a Date object
                const pinExpiryTime = user.pinExpiryTime instanceof Date
                    ? user.pinExpiryTime.toISOString()
                    : user.pinExpiryTime;
                const docRef = yield this.db.collection(this.COLLECTION_NAME).add({
                    email: user.email,
                    baseCurrency: user.baseCurrency,
                    targetCurrency: user.targetCurrency,
                    pinExpiryTime: pinExpiryTime,
                    isVerified: user.isVerified,
                    verificationPin: user.verificationPin,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                const doc = yield docRef.get();
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data === null || data === void 0 ? void 0 : data.email,
                    baseCurrency: data === null || data === void 0 ? void 0 : data.baseCurrency,
                    targetCurrency: data === null || data === void 0 ? void 0 : data.targetCurrency,
                    pinExpiryTime: data === null || data === void 0 ? void 0 : data.pinExpiryTime,
                    isVerified: data === null || data === void 0 ? void 0 : data.isVerified,
                    verificationPin: data === null || data === void 0 ? void 0 : data.verificationPin,
                    createdAt: data === null || data === void 0 ? void 0 : data.createdAt,
                    updatedAt: data === null || data === void 0 ? void 0 : data.updatedAt
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to save user: ${message}`);
            }
        });
    }
    getUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME).where('email', '==', email).limit(1).get();
                if (snapshot.empty) {
                    return null;
                }
                const doc = snapshot.docs[0];
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email,
                    baseCurrency: data.baseCurrency,
                    targetCurrency: data.targetCurrency,
                    pinExpiryTime: data.pinExpiryTime,
                    isVerified: data.isVerified,
                    verificationPin: data.verificationPin,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get user with email ${email}: ${message}`);
            }
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(user.id);
                // Check if document exists
                const doc = yield docRef.get();
                if (!doc.exists) {
                    throw new Error(`User with id ${user.id} not found`);
                }
                // Update the document
                yield docRef.update(Object.assign(Object.assign({}, user), { updatedAt: new Date().toISOString() }));
                // Return the updated user
                const updatedDoc = yield docRef.get();
                const data = updatedDoc.data();
                return Object.assign({ id: updatedDoc.id }, data);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to update user: ${message}`);
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);
                // Check if document exists
                const doc = yield docRef.get();
                if (!doc.exists) {
                    throw new Error(`User with id ${id} not found`);
                }
                yield docRef.delete();
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to delete user with id ${id}: ${message}`);
            }
        });
    }
    // Additional helper methods specific to Firestore
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('email', '==', email)
                    .limit(1)
                    .get();
                if (snapshot.empty) {
                    return null;
                }
                const doc = snapshot.docs[0];
                const data = doc.data();
                return Object.assign({ id: doc.id }, data);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get user by email ${email}: ${message}`);
            }
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .orderBy('createdAt', 'desc')
                    .get();
                const users = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    users.push(Object.assign({ id: doc.id }, data));
                });
                return users;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get all users: ${message}`);
            }
        });
    }
    userExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('email', '==', email)
                    .limit(1)
                    .get();
                return !snapshot.empty;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to check if user exists: ${message}`);
            }
        });
    }
    getUserCount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME).get();
                return snapshot.size;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get user count: ${message}`);
            }
        });
    }
    getVerifiedUsersPaginated() {
        return __awaiter(this, arguments, void 0, function* (pageSize = 50, lastDoc) {
            try {
                let query = this.db.collection(this.COLLECTION_NAME)
                    .where('isVerified', '==', true)
                    .orderBy('createdAt', 'desc')
                    .limit(pageSize);
                if (lastDoc) {
                    query = query.startAfter(lastDoc);
                }
                const snapshot = yield query.get();
                const users = [];
                let lastDocument = null;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    users.push(Object.assign({ id: doc.id }, data));
                    lastDocument = doc;
                });
                return { users, lastDoc: lastDocument };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get verified users: ${message}`);
            }
        });
    }
    getAllVerifiedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = [];
            let lastDoc = null;
            let hasMore = true;
            const pageSize = 50;
            while (hasMore) {
                try {
                    const result = yield this.getVerifiedUsersPaginated(pageSize, lastDoc);
                    allUsers.push(...result.users);
                    lastDoc = result.lastDoc;
                    hasMore = result.users.length === pageSize;
                    console.log(`Fetched ${result.users.length} verified users, total: ${allUsers.length}`);
                }
                catch (error) {
                    console.error('Error fetching verified users page:', error);
                    throw error;
                }
            }
            return allUsers;
        });
    }
    getVerifiedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('isVerified', '==', true)
                    .orderBy('createdAt', 'desc')
                    .get();
                const users = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    users.push(Object.assign({ id: doc.id }, data));
                });
                return users;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get verified users: ${message}`);
            }
        });
    }
    getUnverifiedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const snapshot = yield this.db.collection(this.COLLECTION_NAME)
                    .where('isVerified', '==', false)
                    .orderBy('createdAt', 'desc')
                    .get();
                const users = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    users.push(Object.assign({ id: doc.id }, data));
                });
                return users;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get unverified users: ${message}`);
            }
        });
    }
    // Batch operations
    bulkUpdateUsers(updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batchSize = 500; // Firestore batch limit
                const batches = [];
                for (let i = 0; i < updates.length; i += batchSize) {
                    const batch = this.db.batch();
                    const batchUpdates = updates.slice(i, i + batchSize);
                    batchUpdates.forEach(update => {
                        const docRef = this.db.collection(this.COLLECTION_NAME).doc(update.id);
                        batch.update(docRef, Object.assign(Object.assign({}, update.data), { updatedAt: new Date().toISOString() }));
                    });
                    batches.push(batch.commit());
                }
                yield Promise.all(batches);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to bulk update users: ${message}`);
            }
        });
    }
    generatePin() {
        // Generate a 6 digit pin
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    validatePin(pin, user) {
        if (pin !== user.verificationPin) {
            return false;
        }
        // Convert string date to Date object for comparison
        // Firestore returns a string date
        const expiryTime = typeof user.pinExpiryTime === 'string'
            ? new Date(user.pinExpiryTime)
            : user.pinExpiryTime;
        if (expiryTime < new Date()) {
            return false;
        }
        return true;
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
exports.FirestoreUserStore = FirestoreUserStore;
