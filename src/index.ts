import { config } from './secrets/secrets_manager';
import { LogInfo } from './logger/google.cloud.logger';
import { AppState, initializeApplication } from './router/app'; 
import { setupRoutes } from './router/routes';
require('dotenv').config();


Promise.resolve().then(async () => {
  try {
    const { appState, secrets } = await initializeApplication();
    // wait until app is ready
    while (!appState.isAppReady) {  
      LogInfo("app initializing.....",{});
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    LogInfo("app initialized.....",{});

    const app = setupRoutes(appState, secrets);
    app.listen(process.env.PORT || 8080, () => {
      LogInfo(`Server is running on port ${process.env.PORT || 8080}`,{});
    });
  } catch (error) {
    LogInfo("Failed to initialize application:", error);
    process.exit(1);
  }
});
