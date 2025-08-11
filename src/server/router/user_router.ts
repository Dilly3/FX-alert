import { Router } from "express";
import { UserDataStore } from "../../datastore/datastore";
import { Mailer } from "../../mailer/mailer";
import { config } from "../../secrets/secrets_manager";
import { Validator } from "../validator/validator";
import { newUserHandler } from "../handlers/user_handler";

export function getUserRouter(
  userStore: UserDataStore,
  validator: Validator,
  mailer: Mailer,
  secrets: config
): Router {
  const userRouter = Router();
  const userHandler = newUserHandler(userStore, mailer, secrets);
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

  return userRouter;
}
