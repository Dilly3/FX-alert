
import { UserDataStore } from "../../datastore/datastore";
import { CreateUserDto, UserDto, VerifyUserDto } from "../../model/dtos";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { LogError } from "../../logger/google.cloud.logger";
import { SendGrid } from "../../mailer/sendgrid/sendgrid";
import { PinVerificationEmailData } from "../../mailer/models.mailer";
import { config } from "../../secrets/secrets_manager";
export class UserHandler {
  constructor(private userStore: UserDataStore, private sendgrid: SendGrid, private secrets: config) {}

  createUser = async (req: Request<{}, {}, CreateUserDto>, res: Response) => {
    try {
// check if user already exists
const existingUser = await this.userStore.getUser(req.body.email);
if (existingUser) {
  return res.status(400).json({ message: 'User already exists', success: false });
}

// create user
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
const pinVerificationEmailData: PinVerificationEmailData = {
  pin: user.verificationPin,
  email: user.email,
  expiryTime: user.pinExpiryTime.toUTCString(),
  baseUrl: this.secrets.base_url
}
 await this.sendgrid.sendPinVerificationEmail(pinVerificationEmailData, user.email);
      const result = await this.userStore.saveUser(user);
      // Send verification email
     const userDto: UserDto = {
      email: result.email,
      baseCurrency: result.baseCurrency,
      targetCurrency: result.targetCurrency,
      pinExpiryTime: pinVerificationEmailData.expiryTime,
      isVerified: result.isVerified,
     }
      res.status(201).json({message: 'User created, check your email for verification', user: userDto, success: true});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogError('Error creating user:', message);
        res.status(500).json({ message: 'Error creating user', error: message });
    }
  }

  verifyUser = async (req: Request<{}, {}, {},VerifyUserDto>, res: Response) => {
    try {
      const user = await this.userStore.getUser(req.query.email as string);
      if (!user) {
        return res.status(404).json({ message: 'User not found', success: false });
      }
if (user.isVerified) {
  return res.status(400).json({ message: 'User already verified', success: false });
}
      if (!this.userStore.validatePin(req.query.pin as string, user)) {
        return res.status(401).json({ message: 'Invalid pin', success: false });
      }
      await this.userStore.verifyUser(user.email);
      res.status(200).json({ message: 'User verified', success: true });
    } catch (error) {
    }
  }
}

export const newUserHandler = ( userStore: UserDataStore, sendgrid: SendGrid, secrets: config ) => {
  return new UserHandler(userStore, sendgrid, secrets);
}