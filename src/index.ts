import { LogInfo, LogError } from "./logger/gcp_logger";
import { getAppState } from "./secrets/secrets_manager";
import { initializeAppConfig, initializeApp, AppConfig } from "./server/app";
import { setCurrencyRouter, setupApp, setUserRouter } from "./server/routes";
import { handleSignal } from "./server/sigterm";
require("dotenv").config();
const connections = new Set<any>();
Promise.resolve().then(async () => {
  try {
    LogInfo("Starting application initialization...", {});

    const appConfig = await initializeAppConfig();
    LogInfo("Initializing stores...", {});
    const { userStore, currencyStore, errorLog, forexApi, sendgrid } =
      initializeApp(appConfig);
    // check if app is ready after initialization
    if (!getAppState()) {
      LogError("Application failed to initialize properly", {});
      process.exit(1);
    }

    LogInfo("Application initialized successfully", {});

    let app = setupApp(appConfig.secrets!.env, userStore);
    app = setUserRouter(app, userStore, currencyStore, sendgrid, appConfig);
    app = setCurrencyRouter(
      app,
      appConfig,
      currencyStore,
      forexApi,
      sendgrid,
      userStore,
      errorLog
    );
    const port = process.env.PORT || 8080;

    const server = app.listen(port, () => {
      LogInfo(`Server is running on port ${port}`, {});
      LogInfo("All middleware and routes are active", {});
    });

    // track active connections
    server.on("connection", (connection) => {
      connections.add(connection);
      connection.on("close", () => connections.delete(connection));
    });

    // listen for shutdown signals
    process.on("SIGTERM", () =>
      handleSignal("SIGTERM", server, appConfig, connections)
    );
    process.on("SIGINT", () =>
      handleSignal("SIGINT", server, appConfig, connections)
    );
  } catch (error) {
    LogError("Failed to initialize application:", error);
    process.exit(1);
  }
});
