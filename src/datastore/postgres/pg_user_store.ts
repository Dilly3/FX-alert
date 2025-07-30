import { DataSource, Repository } from "typeorm";
import { UserInfo } from "../../model/model";
import { UserDataStore } from "../datastore";

export class PgUserStore implements UserDataStore {
    private readonly userRepository: Repository<UserInfo>;

    constructor(private readonly db: DataSource) {
        this.userRepository = this.db.getRepository(UserInfo);
    }

    async firstOrCreate(user: UserInfo): Promise<UserInfo> {
        try {
            // Use upsert with email as conflict path
            await this.userRepository.upsert(user, { 
                conflictPaths: ['email'],
                skipUpdateIfNoValuesChanged: true // Performance optimization
            });
            
            // Return the actual entity
            const result = await this.userRepository.findOne({
                where: { email: user.email }
            });
            
            if (!result) {
                throw new Error(`Failed to create or find user with email: ${user.email}`);
            }
            
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to firstOrCreate user: ${message}`);
        }
    }

    generatePin(): string {
        // Generate a 6 digit pin
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async updatePin(email: string, pin: string): Promise<void> {
        try {
            const updateResult = await this.userRepository.update(
                { email },
                { 
                    verificationPin: pin,
                    updatedAt: new Date()
                }
            );

            if (updateResult.affected === 0) {
                throw new Error(`User with email ${email} not found`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update pin for user ${email}: ${message}`);
        }
    }

    async getVerificationPin(email: string): Promise<string> {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
                select: ['verificationPin'] // Only select the pin field
            });

            if (!user) {
                throw new Error(`User with email ${email} not found`);
            }

            if (!user.verificationPin) {
                throw new Error(`No verification pin found for user ${email}`);
            }

            return user.verificationPin;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get verification pin for user ${email}: ${message}`);
        }
    }

 validatePin(pin: string, user: UserInfo) : boolean {
    if (pin !== user.verificationPin) {
        return false;
    }
    if (user.pinExpiryTime < new Date()) {
        return false;
    }
    return true;
}

 async verifyUser(email: string): Promise<void> {
        try {
            const updateResult = await this.userRepository.update(
                { email },
                {   
                    isVerified: true,
                    verificationPin: '',
                    updatedAt: new Date()
                }
            );

            if (updateResult.affected === 0) {
                throw new Error(`User with email ${email} not found`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to verify user ${email}: ${message}`);
        }
    }

    async saveUser(user: UserInfo): Promise<UserInfo> {
        try {
            return await this.userRepository.save(user);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to save user: ${message}`);
        }
    }

    async getUser(id: string): Promise<UserInfo | null> {
        try {
            return await this.userRepository.findOne({
                where: { id }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get user with id ${id}: ${message}`);
        }
    }

    async updateUser(user: UserInfo): Promise<UserInfo> {
        try {
            const updateResult = await this.userRepository.update(
                { id: user.id },
                { ...user, updatedAt: new Date() }
            );

            if (updateResult.affected === 0) {
                throw new Error(`User with id ${user.id} not found`);
            }

            const updatedUser = await this.userRepository.findOne({
                where: { id: user.id }
            });

            if (!updatedUser) {
                throw new Error(`Failed to retrieve updated user with id: ${user.id}`);
            }

            return updatedUser;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update user: ${message}`);
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            const deleteResult = await this.userRepository.delete({ id });

            if (deleteResult.affected === 0) {
                throw new Error(`User with id ${id} not found`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to delete user with id ${id}: ${message}`);
        }
    }

    // Additional helper methods
    async getUserByEmail(email: string): Promise<UserInfo | null> {
        try {
            return await this.userRepository.findOne({
                where: { email }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get user by email ${email}: ${message}`);
        }
    }

    async getAllUsers(): Promise<UserInfo[]> {
        try {
            return await this.userRepository.find({
                order: { createdAt: 'DESC' }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get all users: ${message}`);
        }
    }

    async userExists(email: string): Promise<boolean> {
        try {
            const count = await this.userRepository.count({
                where: { email }
            });
            return count > 0;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to check if user exists: ${message}`);
        }
    }
}