import { CloseFirestoreDB } from "../datastore/firestore/store";
import { ClosePgDB } from "../datastore/postgres/pg_store";
import { LogError } from "../logger/gcp_logger";
import { AppConfig } from "./app";

// force shutdown after timeout
export const forceShutdown = (signal: string, connections: Set<any>): void => {
  setTimeout(() => {
    console.error(`shutdown after timeout (signal: ${signal})`);
    // destroy all connections
    connections.forEach((connection) => connection.destroy());
    process.exit(1);
  }, 10000); // 10 seconds
};
const gracefulShutdown = async (
  signal: string,
  server: any,
  appConfig: AppConfig
) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // stop accepting new connections
    await new Promise<void>((resolve, reject) => {
      server.close((err?: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log("Server closed successfully");

    if (appConfig.dbFirestore != null) {
      try {
        Promise.resolve(CloseFirestoreDB()).then(() => {
          console.log("Firestore connection closed");
        });
      } catch (error) {
        LogError("Error closing Firestore connection", error);
        throw error;
      }
    }

    if (appConfig.dbPG != null) {
      try {
        Promise.resolve(ClosePgDB()).then(() => {
          console.log("PostgreSQL connection closed");
        });
      } catch (error) {
        LogError("Error closing PostgreSQL connection", error);
        throw error;
      }
    }

    if (appConfig.redis != null) {
      try {
        Promise.resolve(appConfig.redis.closeRedis()).then(() => {
          console.log("Redis connection closed");
        });
      } catch (error) {
        LogError("Error closing Redis connection", error);
        throw error;
      }
    }

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
  }
};

export const handleSignal = (
  signal: string,
  server: any,
  appConfig: AppConfig,
  connections: Set<any>
) => {
  forceShutdown(signal, connections);
  gracefulShutdown(signal, server, appConfig);
};
