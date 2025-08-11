import express, { Express } from "express";
import { AppConfig, initializeAppConfig } from "../server/app";
import { httpOK } from "../server/response";
import request from "supertest";
import { setupApp } from "../server/routes";
import { CurrencyHandlerUserStore } from "../datastore/datastore";
import { isRunningInGCP } from "../secrets/secrets_manager";

let app: Express;

jest.mock("../secrets/secrets_manager", () => ({
  ...jest.requireActual("../secrets/secrets_manager"),
  isRunningInGCP: jest.fn(),
}));

(isRunningInGCP as jest.Mock).mockReturnValueOnce(false); // for "local"
(isRunningInGCP as jest.Mock).mockReturnValueOnce(true); // for "GCP"

const store: CurrencyHandlerUserStore = {
  getUser: jest.fn(),
  getVerifiedUsers: jest.fn(),
  groupUsersByCurrency: jest.fn(),
};
const store2: CurrencyHandlerUserStore | null = null;

describe("GET /health", () => {
  it("returns status 200", async () => {
    app = setupApp("dev", store);

    const res = await request(app).get("/v1/health").send();
    expect(res.statusCode).toBe(httpOK);
    expect(res.body).toEqual({
      status: "ready",
      database: "connected",
      environment: "local",
    });
  });
  it("returns status 503 when store is null", async () => {
    app = setupApp("prod", store2);

    const res = await request(app).get("/v1/health").send();
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      status: "initializing",
      database: "disconnected",
      environment: "GCP",
    });
  });
});
