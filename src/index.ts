import express, {Request, Response, Express} from 'express';
import { UserInfo } from './model/model';
import { getDB, initializeDB } from './datastore/postgres/pg_store';
import { pg_user_store } from './datastore/postgres/pg_user_store';
import { database } from 'firebase-admin';
import { DataSource } from 'typeorm';
import { default_config, loadSecrets } from './secrets/secrets_manager';
import { UserCreateDto } from './model/dtos';

const cors = require('cors');
require('dotenv').config()



const app: Express = express();  
app.use(express.json());


const port = process.env.PORT || 8080;


let db: DataSource | null = null;
let userStore: pg_user_store | null = null;



// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: db ? 'connected' : 'disconnected' });
});

app.post('/user/create', (req: Request<{}, {}, UserCreateDto>, res: Response) => {
  // Check if database is ready
  if (!userStore || !db) {
    return res.status(503).json({
      message: 'Database not ready yet',
      error: 'Service temporarily unavailable'
    });
  }
  const user = new UserInfo()
  user.email = req.body.email
  user.firstName = req.body.firstName
  user.lastName = req.body.lastName
  user.fromCurrency = req.body.fromCurrency
  user.toCurrency = req.body.toCurrency
  user.preferences = req.body.preferences
  userStore.saveUser(user).then((user) => {
    res.json({message: 'User saved', user: user});
  }).catch((error) => {
    if (error instanceof Error) {
      res.status(500).json({message: 'Error saving user', error: error.message});
    } else {
      res.status(500).json({message: 'Error saving user', error: 'Unknown error'});
    }
  });
});

// Start server immediately
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Initialize database after server starts
  loadSecrets().then(async () => {
    console.log("Secrets loaded")
    db = await initializeDB(default_config!);
app.use(cors({
  origin: default_config!.env === 'prod' ? 'https://fx-alert.com' : '*',
  credentials: true
}));
    userStore = new pg_user_store(db);
    console.log("Database initialized successfully!");
  }).catch((error) => {
    console.error("Error loading secrets:", error)
  })
  
});
