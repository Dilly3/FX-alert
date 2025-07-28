

import "reflect-metadata";
import { DataSource } from "typeorm";
import { Currency, CurrencyRate, UserInfo } from "../../model/model";
import { config } from "../../secrets/secrets_manager";



let db_instance:DataSource | null = null
export function getDB():DataSource{
    if (db_instance === null) {
        console.log("Database not initialized")
        throw new Error("Database not initialized")
    }
    return db_instance
}

export async function initializePgDB(config:config):Promise<DataSource>{
console.log("initializing db")
console.log("config object",config)

const AppDataSource = new DataSource({
  type: "postgres",
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  
  // SSL configuration for Cloud SQL
  ssl:false,
  
  // Connection pool settings
  extra: {
    max: 5,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  },
  
  synchronize: true,
logging: ["query", "error", "warn", "info"],
  
  entities: [UserInfo, CurrencyRate, Currency]
});
    
    try {
        await AppDataSource.initialize(); 
        console.log("DB initialized!");
        db_instance = AppDataSource;
        return db_instance;
    } catch (error) {
        console.log("Database initialization failed:", error);
        throw error;
    }
}
      