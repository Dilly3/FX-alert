import { CurrencyDataStore } from "./../datastore/datastore";
import { Currency } from "./../model/model";
import { UserDataStore } from "../datastore/datastore";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
const { body, query } = require("express-validator");

export class Validator {
  constructor(
    private userStore: UserDataStore,
    private CurrencyStore: CurrencyDataStore
  ) {}

  RegisterUserValidator = () => {
    return [
      body("firstName")
        .trim()
        .notEmpty()
        .isLength({ min: 2, max: 50 })
        .withMessage("Invalid first name"),
      body("lastName")
        .trim()
        .notEmpty()
        .isLength({ min: 2, max: 50 })
        .withMessage("Invalid last name"),
      body("email")
        .trim("email")
        .notEmpty()
        .isEmail()
        .custom(async (value: string) => {
          const user = await this.userStore.getUser(value);
          if (user) {
            throw new Error("Email already exists");
          }
        })
        .withMessage("Invalid email"),

      body("baseCurrency")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .custom(async (value: string) => {
          const currency = await this.CurrencyStore.getCurrency(value);
          if (!currency) {
            throw new Error("Invalid base currency");
          }
        })
        .withMessage("Invalid base currency"),

      body("targetCurrency")
        .trim()
        .notEmpty()
        .isArray()
        .custom(async (value: string[]) => {
          for (const currencyCode of value) {
            if (typeof currencyCode !== "string" || currencyCode.length !== 3) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
            const currency = await this.CurrencyStore.getCurrency(currencyCode);
            if (!currency) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
          }
        })
        .withMessage("Invalid target currency "),
    ];
  };

  verifyUserValidator = () => {
    return [
      query("pin")
        .trim()
        .notEmpty()
        .isLength({ min: 6, max: 6 })
        .isString()
        .withMessage("Invalid pin"),
      query("email").trim().notEmpty().isEmail().withMessage("email invalid"),
    ];
  };

  convertCurrencyValidator = () => {
    return [
      query("from")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .custom(async (value: string) => {
          const currency = await this.CurrencyStore.getCurrency(value);
          if (!currency) {
            throw new Error("invalid currency");
          }
        })
        .withMessage("invalid currency"),
      query("to")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .custom(async (value: string) => {
          const currency = await this.CurrencyStore.getCurrency(value);
          if (!currency) {
            throw new Error("invalid currency");
          }
        })
        .withMessage("invalid currency"),
      query("amount")
        .trim()
        .notEmpty()
        .isNumeric()
        .withMessage("amount must be a number")
        .custom((value: number) => {
          if (parseFloat(value.toString()) <= 0) {
            throw new Error("amount must be greater than zero");
          }
          return true;
        }),
      query("date")
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("date must be in YYYY-MM-DD format"),
    ];
  };

  liveRatesValidator = () => {
    return [
      query("base")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .custom(async (value: string) => {
          const currency = await this.CurrencyStore.getCurrency(value);
          if (!currency) {
            throw new Error("invalid base currency");
          }
        })
        .withMessage("invalid base currency"),
      query("currencies")
        .trim()
        .notEmpty()
        .isArray()
        .custom(async (value: string[]) => {
          for (const currencyCode of value) {
            if (typeof currencyCode !== "string" || currencyCode.length !== 3) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
            const currency = await this.CurrencyStore.getCurrency(currencyCode);
            if (!currency) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
          }
        })
        .withMessage("invalid target currency "),
      query("email")
        .optional()
        .isEmail()
        .custom(async (value: string) => {
          const user = await this.userStore.getUser(value);
          if (!user || user.isVerified === false) {
            throw new Error("unverified user");
          }
        })
        .withMessage("email invalid"),
    ];
  };
}
