import { userInfo } from "os";
import { UserDataStore } from "../../datastore/datastore";
import { CreateUserDto, VerifyUserDto } from "../../model/dtos";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { UserInfo } from "../../model/model";
import { LogError } from "../../logger/google.cloud.logger";
import { SendGrid } from "../../mailer/sendgrid/sendgrid";
export class UserHandler {
  constructor(private userStore: UserDataStore, private sendgrid: SendGrid) {}

  createUser = async (req: Request<{}, {}, CreateUserDto>, res: Response) => {
    try {
const user = {
    id: uuidv4(),
    email: req.body.email,
    baseCurrency: req.body.baseCurrency,
    targetCurrency: req.body.targetCurrency,
    createdAt: new Date(),
    updatedAt: new Date(),
    pinExpiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
    verificationPin: this.userStore.generatePin(),
    isVerified: false,
}
      const result = await this.userStore.saveUser(user);
      // Send verification email
      await this.sendgrid.sendPinVerificationEmail({pin: user.verificationPin, email: user.email, expiryTime: user.pinExpiryTime.toISOString()}, user.email);
      res.status(201).json({message: 'User created, check your email for verification', user: result, success: true});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogError('Error creating user:', message);
        res.status(500).json({ message: 'Error creating user', error: message });
    }
  }

  verifyUser = async (req: Request<{}, {}, VerifyUserDto>, res: Response) => {
    try {
      const user = await this.userStore.getUser(req.body.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found', success: false });
      }
      if (!this.userStore.validatePin(req.body.pin, user)) {
        return res.status(401).json({ message: 'Invalid pin', success: false });
      }
      await this.userStore.verifyUser(user.email);
      res.status(200).json({ message: 'User verified', success: true });
    } catch (error) {
    }
  }
}

export const newUserHandler = ( userStore: UserDataStore, sendgrid: SendGrid ) => {
  return new UserHandler(userStore, sendgrid);
}