import { CurrencyDataStore } from "./../../datastore/datastore";
import {
  body,
  query,
} from "express-validator/lib/middlewares/validation-chain-builders";
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
  constructor(private currencydb: CurrencyDataStore) {}
  RegisterUserValidator = (): ValidationChain[] => {
    return [
      body("email").notEmpty().isEmail().withMessage("invalid email"),

      body("baseCurrency")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency")
        .custom((value) => {
          const currency = this.currencydb.getCurrency(value);
          if (!currency) {
            throw new Error(`currency ${value} is not supported`);
          }
          return true;
        }),

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
        .trim()
        .notEmpty()
        .isLength({ min: 6, max: 6 })
        .isString()
        .withMessage("Invalid pin"),
      query("email").notEmpty().isEmail().withMessage("email invalid"),
    ];
  };

  convertCurrencyValidator = (): ValidationChain[] => {
    return [
      query("from")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency")
        .custom((value) => {
          const currency = this.currencydb.getCurrency(value);
          if (!currency) {
            throw new Error(`currency ${value} is not supported`);
          }
          return true;
        }),

      query("to")
        .notEmpty()
        .isLength({ min: 3, max: 3 })
        .withMessage("invalid currency")
        .custom((value) => {
          const currency = this.currencydb.getCurrency(value);
          if (!currency) {
            throw new Error(`currency ${value} is not supported`);
          }
          return true;
        }),

      query("amount")
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
        .withMessage("invalid base currency")
        .custom((value) => {
          const currency = this.currencydb.getCurrency(value);
          if (!currency) {
            throw new Error(`currency ${value} is not supported`);
          }
          return true;
        }),

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

export function newValidator(currencydb: CurrencyDataStore): Validator {
  return new Validator(currencydb);
}
