import * as admin from "firebase-admin";
import * as serviceAccount from "../../../service-account-key.json";
import { Firestore} from "@google-cloud/firestore";
import { default_config } from "../../secrets/secrets_manager";



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: default_config!.projectId || serviceAccount.project_id,
   storageBucket: default_config!.firebase_storage_bucket
  });
}

const db: Firestore = admin.firestore();

export const getdb = (): Firestore => db;



