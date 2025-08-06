import { LogInfo, LogError } from './logger/gcp_logger';
import { initializeApplication } from './server/app'; 
import { setupRoutes } from './server/routes';
require('dotenv').config();


Promise.resolve().then(async () => {
  try {
    LogInfo("Starting application initialization...", {});
    
    const { appState} = await initializeApplication();
    
    // Check if app is ready after initialization
    if (!appState.isAppReady) {
      LogError("Application failed to initialize properly", {});
      process.exit(1);
    }
    
    LogInfo("Application initialized successfully", {});

    const app = setupRoutes(appState);
    const port = process.env.PORT || 8080;
    
    app.listen(port, () => {
      LogInfo(`Server is running on port ${port}`, {});
      LogInfo("All middleware and routes are active", {});
    });
    
  } catch (error) {
    LogError("Failed to initialize application:", error);
    process.exit(1);
  }
});
