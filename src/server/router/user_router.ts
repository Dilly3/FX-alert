import { Router } from "express";
import {
  UserHandlerUserStore,
  ValidatorCurrencyStore,
} from "../../datastore/datastore";
import { Mailer } from "../../mailer/mailer";
import { config } from "../../secrets/secrets_manager";
import { newValidator } from "../validator/validator";
import { newUserHandler } from "../handlers/user_handler";
import { Express } from "express";

export function getUserRouter(
  app: Express,
  userStore: UserHandlerUserStore,
  validatordb: ValidatorCurrencyStore,
  mailer: Mailer,
  secrets: config
): Express {
  const userRouter = Router();
  const userHandler = newUserHandler(userStore, mailer, secrets);
  const validator = newValidator(validatordb);
  // User routes
  userRouter.post(
    "/register",
    validator.RegisterUserValidator(),
    userHandler.createUser
  );
  userRouter.get(
    "/verify",
    validator.verifyUserValidator(),
    userHandler.verifyUser
  );

  app.use("/v1/user", userRouter);
  return app;
}
