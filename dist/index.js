"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const gcp_logger_1 = require("./logger/gcp_logger");
const app_1 = require("./server/app");
const routes_1 = require("./server/routes");
require('dotenv').config();
Promise.resolve().then(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, gcp_logger_1.LogInfo)("Starting application initialization...", {});
        const { appState, secrets } = yield (0, app_1.initializeApplication)();
        // Check if app is ready after initialization
        if (!appState.isAppReady) {
            (0, gcp_logger_1.LogError)("Application failed to initialize properly", {});
            process.exit(1);
        }
        (0, gcp_logger_1.LogInfo)("Application initialized successfully", {});
        const app = (0, routes_1.setupRoutes)(appState, secrets);
        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            (0, gcp_logger_1.LogInfo)(`Server is running on port ${port}`, {});
            (0, gcp_logger_1.LogInfo)("All middleware and routes are active", {});
        });
    }
    catch (error) {
        (0, gcp_logger_1.LogError)("Failed to initialize application:", error);
        process.exit(1);
    }
}));
