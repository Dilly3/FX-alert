import express, { Request, Response, Express } from 'express';
import { UserInfo } from './model/model';
import { DataSource } from 'typeorm';
import { config, isRunningInGCP, loadSecrets } from './secrets/secrets_manager';
import { UserCreateDto } from './model/dtos';
import { ForexApi } from './fx/forex_api/forex_api';
import { 
  CurrencyDataStore, 
  getCurrencyDataStore, 
  getUserStore, 
  UserDataStore,
} from './datastore/datastore';
import { initializeFirestore } from './datastore/firestore/store';
import { initializePgDB } from './datastore/postgres/pg_store';
import { Firestore } from '@google-cloud/firestore';
import { LogError, LogInfo } from './logger/google.cloud.logger';

const cors = require('cors');
let secrets: config | null = null;
require('dotenv').config();

const app: Express = express();
app.use(express.json());

const port = process.env.PORT || 8080;

let dbPG: DataSource | null = null;
let dbFirestore: Firestore | null = null;
let userStore: UserDataStore | null = null;
let currencyStore: CurrencyDataStore | null = null;
let isAppReady = false;

async function initializeApplication() {
  try {
    console.log("Loading secrets...");
    secrets = await loadSecrets();
    console.log("Secrets loaded");

    console.log("Initializing databases...");
    const isGCP = isRunningInGCP();
    
    if (isGCP) {
      console.log("Running in GCP, initializing Firestore...");
      try {
        dbFirestore = await initializeFirestore('fx-alert-db');
        console.log("Firestore initialized successfully");
      } catch (error) {
        LogError("Firestore initialization failed:", error);
        throw new Error(`Firestore initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log("Running locally, initializing PostgreSQL...");
      try {
        dbPG = await initializePgDB(secrets!);
        console.log("PostgreSQL initialized successfully");
      } catch (error) {
        LogError("PostgreSQL initialization failed:", error);
        throw new Error(`PostgreSQL initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Configure CORS after secrets are loaded
    const corsOptions = {
      origin: secrets!.env === 'prod' ? 'https://fx-alert.com' : '*',
      credentials: true
    };
    app.use(cors(corsOptions));

    console.log("Initializing stores...");
    userStore = getUserStore(dbPG, dbFirestore);
    currencyStore = getCurrencyDataStore(dbPG, dbFirestore);
    console.log("Stores initialized successfully");

    isAppReady = true;
    console.log("All systems initialized and ready!");

  } catch (error) {
    LogError("app initialization failed:", error);
    process.exit(1); 
  }
}

// Middleware to check if app is ready
function ensureAppReady(req: any, res: any, next: any) {
  if (!isAppReady) {
    return res.status(503).json({
      message: 'Application is still initializing',
      error: 'Service temporarily unavailable'
    });
  }
  next();
}

// Health check endpoint (always available)
app.get('/health', (req, res) => {
  const isGCP = isRunningInGCP();
  const dbStatus = isGCP 
    ? (dbFirestore ? 'connected' : 'disconnected')
    : (dbPG ? 'connected' : 'disconnected');
    
  res.status(isAppReady ? 200 : 503).json({ 
    status: isAppReady ? 'ready' : 'initializing',
    database: dbStatus,
    environment: isGCP ? 'GCP' : 'local'
  });
});

// Apply middleware to API routes
app.use('/user', ensureAppReady);
app.use('/currency', ensureAppReady);

app.post('/user/create', (req: Request<{}, {}, UserCreateDto>, res: Response) => {
  const user = new UserInfo();
  user.email = req.body.email;
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.fromCurrency = req.body.fromCurrency;
  user.toCurrency = req.body.toCurrency;
  user.preferences = req.body.preferences;

  userStore!.firstOrCreate(user).then((user: UserInfo) => {
    res.json({ message: 'User saved', user: user });
  }).catch((error: Error) => {
    LogError('Error saving user:', error);
    res.status(500).json({ message: 'Error saving user', error: error.message });
  });
});

app.get('/currency/list', (req: Request, res: Response) => {
  const forexApi = new ForexApi(secrets!.forex_api_key, currencyStore!);
  forexApi.getSupportedCurrencies().then((currencies) => {
    res.json({ message: 'Currencies retrieved', currencies: currencies });
  }).catch((error: Error) => {
    LogError('Error getting currencies:', error);
    res.status(500).json({ message: 'Error getting currencies', error: error.message });
  });
});

// Start server first, then initialize
app.listen(port, () => {
  LogInfo(`Server is running on port ${port}`,{});
  LogInfo("Starting application initialization...",{});
  
  // Initialize in background
  initializeApplication();
});