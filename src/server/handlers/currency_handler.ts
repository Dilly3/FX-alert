import { ForexApi } from "../../fx/forex_api/forex_api";
import { LogError, LogInfo } from "../../logger/gcp_logger";
import express, { Request, Response, Express } from "express";
import { LiveRatesRequest } from "../../model/dtos";
import { SendGrid } from "../../mailer/sendgrid/sendgrid";
import { ErrorLogStore, UserDataStore } from "../../datastore/datastore";
import { ErrorLog, UserInfo } from "../../model/model";

export class CurrencyHandler {
  private readonly RATE_LIMIT_DELAY = 100; // ms between API calls
  constructor(
    private forexApi: ForexApi,
    private sendgrid: SendGrid,
    private userStore: UserDataStore,
    private errorLog: ErrorLogStore
  ) {}

  listCurrencies = () => {
    return async (req: Request, res: Response) => {
      try {
        const currencies = await this.forexApi.getSupportedCurrencies();
        res.json({ message: "Currencies retrieved", currencies: currencies });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        LogError("Error getting currencies:", message);
        res
          .status(500)
          .json({ message: "Error getting currencies", error: message });
      }
    };
  };

  convertCurrency = () => {
    return async (
      req: Request<
        {},
        {},
        {},
        { from: string; to: string; amount: number; date?: string }
      >,
      res: Response
    ) => {
      try {
        const request = req.query;
        const response = await this.forexApi.convertCurrency(
          request.from,
          request.to,
          request.amount,
          request.date
        );
        const result = this.forexApi.formatCurrency(response.result);
        res.json({
          message: "Currency converted",
          result: result,
          success: true,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        LogError("Error converting currency:", message);
        res
          .status(500)
          .json({ message: "Error converting currency", error: message });
      }
    };
  };

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getLiveRates = () => {
    return async (
      req: Request<{}, {}, {}, LiveRatesRequest>,
      res: Response
    ) => {
      try {
        const request = req.query;
        const response = await this.forexApi.getLiveRates(
          request.base,
          request.currencies
        );
        if (request.email) {
          //check email is verified
          const user = await this.userStore.getUser(request.email);
          if (!user || !user.isVerified) {
            res
              .status(400)
              .json({ message: "Email not verified", success: false });
            return;
          }
          await this.sendgrid.sendFxRateEmail(response, request.email);
          res.json({ message: "Live rates sent to mail", success: true });
        } else {
          res.json({
            message: "Live rates retrieved",
            rates: response.rates,
            success: true,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        LogError("Error getting live rates:", message);
        res
          .status(500)
          .json({ message: "Error getting live rates", error: message });
      }
    };
  };

  async prefetchRates(
    currencyGroups: Map<string, UserInfo[]>,
    operation: string
  ): Promise<void> {
    const uniquePairs = Array.from(currencyGroups.keys());

    LogInfo(
      `Pre-fetching rates for ${uniquePairs.length} unique currency pairs`,
      operation
    );

    for (const pair of uniquePairs) {
      try {
        const [baseCurrency, targetCurrencies] = pair.split("_");
        const targets = targetCurrencies.split(",");

        const rates = await this.forexApi.getLiveRates(baseCurrency, targets);
        await this.delay(this.RATE_LIMIT_DELAY);
      } catch (error) {
        LogError(`Failed to fetch rates for ${pair}: ${error}`, operation);
      }
    }
  }

  ratesScheduler = () => {
    return async (
      req: Request<{}, {}, { operation: string }>,
      res: Response
    ) => {
      try {
        // Get all verified users
        const verifiedUsers = await this.userStore.getVerifiedUsers();
        if (verifiedUsers.length === 0) {
          res.json({
            message: "No verified users found",
            success: true,
            processedUsers: 0,
          });
          return;
        }

        const groupedusers = this.userStore.groupUsersByCurrency(verifiedUsers);
        await this.prefetchRates(groupedusers, req.body.operation);
        let processedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        // Process users concurrently
        const promises = verifiedUsers.map((user) => this.processUser(user));
        const results = await Promise.allSettled(promises);

        results.forEach((promiseResult, index) => {
          const user = verifiedUsers[index];

          if (promiseResult.status === "fulfilled") {
            if (promiseResult.value.success) {
              processedCount++;
            }
            if (promiseResult.value.errorMsg) {
              errors.push(promiseResult.value.errorMsg);
              errorCount++;
            }
          }
        });

        // Log summary with all errors as array
        if (errorCount > 0) {
          const errorLogs: ErrorLog = {
            operation: req.body.operation,
            id: uuidv4(),
            date: new Date(),
            errorMessage: errors.join(" | "),
            createdAt: new Date(),
          };
          this.errorLog.saveError(errorLogs);
          LogError(
            `Rates scheduler completed with ${errorCount}`,
            "ratesScheduler"
          );
        } else {
          LogInfo(
            `Rates scheduler completed: ${processedCount} users processed successfully`,
            "ratesScheduler"
          );
        }

        res.status(200).json({
          message: "Rates scheduler completed",
          success: true,
          processedUsers: processedCount,
          errorCount: errorCount,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        LogError("Error in rates scheduler:", message);
        res.status(500).json({
          message: "Error in rates scheduler",
          error: message,
          success: false,
        });
      }
    };
  };

  // processUser
  async processUser(
    user: UserInfo
  ): Promise<{ success: boolean; errorMsg?: string }> {
    // Check if user has base and target currencies
    if (
      !user.baseCurrency ||
      !user.targetCurrency ||
      user.targetCurrency.length === 0
    ) {
      return {
        success: false,
        errorMsg: `User ${user.email} missing currency preferences`,
      };
    }
    // Get live rates for user's currency preferences
    // The getLiveRates method already handles Redis caching
    try {
      const response = await this.forexApi.getLiveRates(
        user.baseCurrency,
        user.targetCurrency
      );
      // Send email to user
      await this.sendgrid.sendFxRateEmail(response, user.email);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, errorMsg: errorMessage };
    }
  }
}

export const newCurrencyHandler = (
  forexApi: ForexApi,
  sendgrid: SendGrid,
  userStore: UserDataStore,
  errorLog: ErrorLogStore
) => {
  return new CurrencyHandler(forexApi, sendgrid, userStore, errorLog);
};

function uuidv4(): string {
  throw new Error("Function not implemented.");
}
