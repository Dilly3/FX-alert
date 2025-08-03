import { Firestore, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { UserInfo, collection, ErrorLog } from "../../model/model";
import { UserDataStore } from "../datastore";



export class FirestoreUserStore implements UserDataStore {
    private readonly COLLECTION_NAME = collection.USER;

    constructor(private readonly db: Firestore) {}

    async firstOrCreate(user: UserInfo): Promise<UserInfo> {
        try {
            // Check if user exists by email
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('email', '==', user.email)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                // User exists, return existing user
                const doc = snapshot.docs[0];
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as UserInfo;
            }

            // User doesn't exist, create new one
            // Convert pinExpiryTime to ISO string if it's a Date object
            const pinExpiryTime = user.pinExpiryTime instanceof Date 
                ? user.pinExpiryTime.toISOString() 
                : user.pinExpiryTime;
                
            const docRef = await this.db.collection(this.COLLECTION_NAME).add({
                ...user,
                pinExpiryTime: pinExpiryTime,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isVerified: false
            });

            const newDoc = await docRef.get();
            const newData = newDoc.data();
            
            return {
                id: newDoc.id,
                email: newData?.email,
                baseCurrency: newData?.baseCurrency,
                targetCurrency: newData?.targetCurrency,
                pinExpiryTime: newData?.pinExpiryTime,
                isVerified: newData?.isVerified,
                verificationPin: newData?.verificationPin,
                createdAt: newData?.createdAt,
            } as UserInfo;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to firstOrCreate user: ${message}`);
        }
    }

    async updatePin(email: string, pin: string): Promise<void> {
        try {
            // Find user by email
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                throw new Error(`User with email ${email} not found`);
            }

            const doc = snapshot.docs[0];
            await doc.ref.update({
                verificationPin: pin,
                pinGeneratedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update pin for user ${email}: ${message}`);
        }
    }

    async getVerificationPin(email: string): Promise<string> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                throw new Error(`User with email ${email} not found`);
            }

            const doc = snapshot.docs[0];
            const data = doc.data();
            
            if (!data?.verificationPin) {
                throw new Error(`No verification pin found for user ${email}`);
            }

            return data.verificationPin;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get verification pin for user ${email}: ${message}`);
        }
    }

    async verifyUser(email: string): Promise<void> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                throw new Error(`User with email ${email} not found`);
            }

            const doc = snapshot.docs[0];
            await doc.ref.update({
                isVerified: true,
                verifiedAt: new Date().toISOString(),
                verificationPin: null, // Clear the pin after verification
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to verify user ${email}: ${message}`);
        }
    }

    async saveUser(user: UserInfo): Promise<UserInfo> {
        try {
            // Convert pinExpiryTime to ISO string if it's a Date object
            const pinExpiryTime = user.pinExpiryTime instanceof Date 
                ? user.pinExpiryTime.toISOString() 
                : user.pinExpiryTime;
                
            const docRef = await this.db.collection(this.COLLECTION_NAME).add({
                email: user.email,
                baseCurrency: user.baseCurrency,
                targetCurrency: user.targetCurrency,
                pinExpiryTime: pinExpiryTime,
                isVerified: user.isVerified,
                verificationPin: user.verificationPin,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const doc = await docRef.get();
            const data = doc.data();

            return {
                id: doc.id,
                email: data?.email,
                baseCurrency: data?.baseCurrency,
                targetCurrency: data?.targetCurrency,
                pinExpiryTime: data?.pinExpiryTime,
                isVerified: data?.isVerified,
                verificationPin: data?.verificationPin,
                createdAt: data?.createdAt,
                updatedAt: data?.updatedAt
            } as UserInfo;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to save user: ${message}`);
        }
    }

    async getUser(email: string): Promise<UserInfo | null> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME).where('email', '==', email).limit(1).get();

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
            } as UserInfo;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get user with email ${email}: ${message}`);
        }
    }

    async updateUser(user: UserInfo): Promise<UserInfo> {
        try {
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(user.id);
            
            // Check if document exists
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new Error(`User with id ${user.id} not found`);
            }

            // Update the document
            await docRef.update({
                ...user,
                updatedAt: new Date().toISOString()
            });

            // Return the updated user
            const updatedDoc = await docRef.get();
            const data = updatedDoc.data();

            return {
                id: updatedDoc.id,
                ...data
            } as UserInfo;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update user: ${message}`);
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            const docRef = this.db.collection(this.COLLECTION_NAME).doc(id);
            
            // Check if document exists
            const doc = await docRef.get();
            if (!doc.exists) {
                throw new Error(`User with id ${id} not found`);
            }

            await docRef.delete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to delete user with id ${id}: ${message}`);
        }
    }

    // Additional helper methods specific to Firestore
    async getUserByEmail(email: string): Promise<UserInfo | null> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            const data = doc.data();
            
            return {
                id: doc.id,
                ...data
            } as UserInfo;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get user by email ${email}: ${message}`);
        }
    }

    async getAllUsers(): Promise<UserInfo[]> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .orderBy('createdAt', 'desc')
                .get();

            const users: UserInfo[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    ...data
                } as UserInfo);
            });

            return users;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get all users: ${message}`);
        }
    }

    async userExists(email: string): Promise<boolean> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('email', '==', email)
                .limit(1)
                .get();

            return !snapshot.empty;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to check if user exists: ${message}`);
        }
    }

    async getUserCount(): Promise<number> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME).get();
            return snapshot.size;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get user count: ${message}`);
        }
    }

private async getVerifiedUsersPaginated(pageSize = 50, lastDoc?: any): Promise<{users: UserInfo[], lastDoc: any}> {
    try {
        let query = this.db.collection(this.COLLECTION_NAME)
            .where('isVerified', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(pageSize);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();

        const users: UserInfo[] = [];
        let lastDocument = null;

        snapshot.forEach(doc => {
            const data = doc.data();
            users.push({
                id: doc.id,
                ...data
            } as UserInfo);
            lastDocument = doc;
        });

        return { users, lastDoc: lastDocument };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to get verified users: ${message}`);
    }
}


async getAllVerifiedUsers(): Promise<UserInfo[]> {
    const allUsers: UserInfo[] = [];
    let lastDoc: any = null;
    let hasMore = true;
    const pageSize = 50; 

    while (hasMore) {
        try {
            const result = await this.getVerifiedUsersPaginated(pageSize, lastDoc);
            
            allUsers.push(...result.users);
            
            lastDoc = result.lastDoc;
            
            hasMore = result.users.length === pageSize;
            
            console.log(`Fetched ${result.users.length} verified users, total: ${allUsers.length}`);
            
        } catch (error) {
            console.error('Error fetching verified users page:', error);
            throw error;
        }
    }

    return allUsers;
}


    async getVerifiedUsers(): Promise<UserInfo[]> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('isVerified', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            const users: UserInfo[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    ...data
                } as UserInfo);
            });

            return users;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get verified users: ${message}`);
        }
    }

    async getUnverifiedUsers(): Promise<UserInfo[]> {
        try {
            const snapshot = await this.db.collection(this.COLLECTION_NAME)
                .where('isVerified', '==', false)
                .orderBy('createdAt', 'desc')
                .get();

            const users: UserInfo[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    ...data
                } as UserInfo);
            });

            return users;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get unverified users: ${message}`);
        }
    }

    // Batch operations
    async bulkUpdateUsers(updates: Array<{id: string, data: Partial<UserInfo>}>): Promise<void> {
        try {
            const batchSize = 500; // Firestore batch limit
            const batches = [];

            for (let i = 0; i < updates.length; i += batchSize) {
                const batch = this.db.batch();
                const batchUpdates = updates.slice(i, i + batchSize);

                batchUpdates.forEach(update => {
                    const docRef = this.db.collection(this.COLLECTION_NAME).doc(update.id);
                    batch.update(docRef, {
                        ...update.data,
                        updatedAt: new Date().toISOString()
                    });
                });

                batches.push(batch.commit());
            }

            await Promise.all(batches);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to bulk update users: ${message}`);
        }
    }

    generatePin(): string {
        // Generate a 6 digit pin
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    validatePin(pin: string, user: UserInfo): boolean {
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

  groupUsersByCurrency(users: UserInfo[]): Map<string, any[]> {
        const groups = new Map<string, UserInfo[]>();
        
        users.forEach(user => {
                  const key = Array.isArray(user.targetCurrency) ? 
`${user.baseCurrency}_${user.targetCurrency.sort().join(',')}` : 
`${user.baseCurrency}_${user.targetCurrency}`
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(user);
        });

        return groups;
    }


}