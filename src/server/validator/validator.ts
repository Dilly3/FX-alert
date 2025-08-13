import { ValidatorCurrencyStore } from "./../../datastore/datastore";
import {
  body,
  query,
} from "express-validator/lib/middlewares/validation-chain-builders";
import { ValidationChain } from "express-validator/lib/chain/validation-chain";

export interface validationError {
  location: string;
  msg: string;
  path: string;
  value: string;
  type: string;
}

export class Validator {
  constructor(private currencydb: ValidatorCurrencyStore) {}
  RegisterUserValidator = (): ValidationChain[] => {
    return [
      body("email").notEmpty().isEmail().withMessage("invalid email"),

      body("baseCurrency")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency")
        .custom(async (value) => {
          const currency = await this.currencydb.getCurrency(value);
          if (currency == null) {
            throw new Error(`currency ${value} is not supported`);
          }
        }),

      body("targetCurrency")
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
            const currency = await this.currencydb.getCurrency(currencyCode);
            if (!currency) {
              throw new Error(`currency ${currencyCode} is not supported`);
            }
          }
        }),
    ];
  };

  verifyUserValidator = (): ValidationChain[] => {
    return [
      query("pin")
        .notEmpty()
        .isLength({ min: 6, max: 6 })
        .isString()
        .withMessage("Invalid pin"),

      query("email").notEmpty().isEmail().withMessage("email invalid"),
    ];
  };

  // Convert currency validator
  convertCurrencyValidator = (): ValidationChain[] => {
    return [
      query("from")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency")
        .custom(async (value) => {
          const currency = await this.currencydb.getCurrency(value);
          if (currency == null) {
            throw new Error(`currency ${value} is not supported`);
          }
        }),

      query("to")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency")
        .custom(async (value) => {
          const currency = await this.currencydb.getCurrency(value);
          if (currency == null) {
            throw new Error(`currency ${value} is not supported`);
          }
        }),

      query("amount")
        .notEmpty()
        .isNumeric()
        .withMessage("amount must be a number")
        .custom((value: number) => {
          if (parseFloat(value.toString()) <= 0) {
            throw new Error("amount must be greater than zero");
          }
        }),
      query("date")
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("date must be in YYYY-MM-DD format"),
    ];
  };

  // Live rates validator
  liveRatesValidator = (): ValidationChain[] => {
    return [
      query("base")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid base currency")
        .custom(async (value) => {
          const currency = await this.currencydb.getCurrency(value);
          if (currency == null) {
            throw new Error(`currency ${value} is not supported`);
          }
        }),

      query("currencies")
        .notEmpty()
        .withMessage(
          `target currencies should be an array of one or more currency codes`
        )
        .custom(async (value: string) => {
          const currencyCodes = value.split(",");
          for (const currencyCode of currencyCodes) {
            if (typeof currencyCode !== "string" || currencyCode.length !== 3) {
              throw new Error(`currency code ${currencyCode} is invalid`);
            }
            const currency = await this.currencydb.getCurrency(currencyCode);
            if (!currency) {
              throw new Error(`currency ${currencyCode} is not supported`);
            }
          }
        }),

      query("email").optional().isEmail().withMessage("email invalid"),
    ];
  };
}

export function newValidator(currencydb: ValidatorCurrencyStore): Validator {
  return new Validator(currencydb);
}
