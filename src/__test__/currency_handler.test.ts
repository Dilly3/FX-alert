import express, { Express } from "express";
import { setAppState } from "../secrets/secrets_manager";
import { AppConfig, initializeAppConfig } from "../server/app";
import { httpBadRequest, httpOK } from "../server/response";
import { setCurrencyRouter, setupApp, setUserRouter } from "../server/routes";
import request from "supertest";
import { ConvertCurrencyResponse } from "../model/dtos";
import { MockValidatorDB } from "./__mocks__/validation.mocks";
import { MockFxAgent } from "./__mocks__/fx.mocks";
import { MockMailer } from "./__mocks__/mailer.mocks";
import { GetMockCurrencyHandlerUserStore } from "./__mocks__/user_store.mocks";
import { GetMockErrorLogStore } from "./__mocks__/error_log.mocks";

jest.mock("../server/app", () => ({
  ...jest.requireActual("../server/app"),
  initializeApp: jest.fn(),
  initializeAppConfig: jest.fn(),
}));

let app: Express;
let appConfig: AppConfig = {
  dbFirestore: null!,
  dbPG: null!,
  secrets: {
    env: "test",
    rate_limit_max: 10,
    rate_limit_window: 60,
  },
};

const convertCurrencyResponse: ConvertCurrencyResponse = {
  success: true,
  query: {
    from: "USD",
    to: "EUR",
    amount: 100,
  },
  info: {
    quote: 0.85,
    timestamp: Date.now(),
  },
  result: 85.0,
};

// RUN TEST
describe("GET /v1/currency/convert", () => {
  let app: Express;

  const fx = MockFxAgent();
  fx.convertCurrency.mockReturnValueOnce(convertCurrencyResponse);
  fx.formatCurrency.mockReturnValueOnce("85.00");

  const validatordb = MockValidatorDB();
  validatordb.getCurrency.mockResolvedValueOnce("USD");
  validatordb.getCurrency.mockResolvedValueOnce("EUR");

  const mailer = MockMailer();
  beforeEach(() => {
    jest.clearAllMocks();
    const currencyUserStore = GetMockCurrencyHandlerUserStore();
    const errorLog = GetMockErrorLogStore();

    // Setup mocks
    (initializeAppConfig as jest.Mock).mockResolvedValue(appConfig);

    // Setup app
    app = setupApp("test", currencyUserStore);
    setAppState(true);
    app = setCurrencyRouter(
      app,
      appConfig,
      validatordb,
      fx,
      mailer,
      currencyUserStore,
      errorLog
    );
  });

  it("returns status 400 for invalid currency", async () => {
    const res = await request(app).get("/v1/currency/convert").query({
      from: "US", // Invalid currency code
      to: "EUR",
      amount: 100,
    });

    expect(res.statusCode).toBe(httpBadRequest);
    expect(res.body.error).toBe("bad request");
  });

  it("returns status 200 for valid conversion", async () => {
    const res = await request(app).get("/v1/currency/convert").query({
      from: "USD",
      to: "EUR",
      amount: 100,
      date: "2023-01-01",
    });

    expect(fx.convertCurrency.mock.calls).toHaveLength(1);
    expect(fx.formatCurrency.mock.calls).toHaveLength(1);
    expect(res.statusCode).toBe(httpOK);
    expect(res.body.success).toBe(true);
    expect(res.body).toEqual({
      result: "85.00",
      message: "Currency converted",
      success: true,
    });
  });
});
