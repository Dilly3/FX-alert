import * as admin from "firebase-admin";
import * as serviceAccount from "../../service-account-key.json";
import { Firestore} from "@google-cloud/firestore";



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
   storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db: Firestore = admin.firestore();

export const getdb = (): Firestore => db;



