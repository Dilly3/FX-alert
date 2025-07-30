const { initializeApplication } = require("./dist/router/app");

async function debugInitialization() {
  console.log("=== Starting App Initialization Debug ===");

  try {
    console.log("1. Attempting to initialize application...");
    const { appState, secrets } = await initializeApplication();

    console.log("✅ SUCCESS: Application initialized successfully!");
    console.log("App State:", {
      isAppReady: appState.isAppReady,
      hasUserStore: !!appState.userStore,
      hasCurrencyStore: !!appState.currencyStore,
      hasForexApi: !!appState.forexApi,
      hasSendGrid: !!appState.sendgrid,
      hasDbPG: !!appState.dbPG,
      hasDbFirestore: !!appState.dbFirestore,
    });
  } catch (error) {
    console.error("❌ FAILED: Application initialization failed");
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Provide specific debugging steps based on error
    if (error.message.includes("Missing required environment variables")) {
      console.log("\n🔧 DEBUGGING TIP: Check your environment variables");
      console.log("Make sure all required env vars are set in your .env file");
    } else if (error.message.includes("Database")) {
      console.log("\n🔧 DEBUGGING TIP: Check your database connection");
      console.log("Verify database credentials and connectivity");
    } else if (error.message.includes("SendGrid")) {
      console.log("\n🔧 DEBUGGING TIP: Check SendGrid configuration");
      console.log("Verify SENDGRID_API_KEY and related settings");
    }
  }
}

debugInitialization();
