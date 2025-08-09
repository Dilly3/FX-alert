import {
  body,
  query,
} from "express-validator/lib/middlewares/validation-chain-builders";
import { CurrencyDataStore } from "../../datastore/datastore";
import { UserDataStore } from "../../datastore/datastore";
import { ValidationChain } from "express-validator/lib/chain/validation-chain";

export interface validationError {
  location: string;
  msg: string;
  path: string;
  value: string;
  type: string;
}

export function getValidationError(errors: any[]): validationError[] {
  return errors.map((e: any) => {
    return {
      location: e.location,
      msg: e.msg,
      path: e.path,
      value: e.value,
      type: e.type,
    };
  });
}

export class Validator {
  constructor(
  ) {}
  RegisterUserValidator = (): ValidationChain[] => {
    return [
      body("email")
        .notEmpty()
        .isEmail().customSanitizer(value => {
        console.log(`Email after sanitization: ${value}`)
        return value;
      }).withMessage("invalid email"),

      body("baseCurrency")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency"),

      body("targetCurrency")
        .trim()
        .notEmpty()
        .isArray()
        .withMessage(
          "target currencies should be an array of one or more currency codes"
        )
        .custom(async (value: string[]) => {
          for (const currencyCode of value) {
            if (typeof currencyCode !== "string" || currencyCode.length !== 3) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
          }
        }),
    ];
  };

  verifyUserValidator = (): ValidationChain[] => {
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

  convertCurrencyValidator = (): ValidationChain[] => {
    return [
      query("from")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency"),
       
      query("to")
        .trim()
        .notEmpty()
        .isLength({ min: 3, max: 3 })
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

  liveRatesValidator = (): ValidationChain[] => {
    return [
      query("base")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid base currency"),

      query("currencies")
        .trim()
        .notEmpty()
        .isArray()
        .withMessage(
          `target currencies should be an array of one or more currency codes`
        )
        .custom(async (value: string[]) => {
          for (const currencyCode of value) {
            if (typeof currencyCode !== "string" || currencyCode.length !== 3) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
          }
        }),

      query("email")
        .optional()
        .isEmail()
        .withMessage("email invalid"),
    ];
  };
}
