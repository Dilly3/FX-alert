import * as admin from "firebase-admin";
import * as serviceAccount from "../../../service-account-key.json";
import { Firestore } from "@google-cloud/firestore";
import { default_config } from "../../secrets/secrets_manager";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let db: Firestore | null = null;

export async function initializeFirestore(
  databaseId?: string
): Promise<Firestore> {
  try {
    console.log(
      `Initializing Firestore with database: ${databaseId || "(default)"}`
    );
    console.log(
      `Project ID: ${default_config!.projectId! || serviceAccount.project_id}`
    );

    if (!getApps().length) {
      console.log("Initializing Firebase Admin App...");
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
        projectId: default_config!.projectId! || serviceAccount.project_id,
        storageBucket: default_config!.firebase_storage_bucket!,
      });
      console.log("Firebase Admin App initialized");
    }

    console.log("Getting Firestore instance...");
    const app = admin.app();
    db = getFirestore(app, databaseId || "(default)");

    console.log("Testing Firestore connection...");
    const testCollection = db.collection("_connection_test");
    await testCollection.limit(1).get();

    console.log("Firestore connection successful");
    return db;
  } catch (error) {
    console.error("Firestore initialization failed:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "Unknown stack",
    });

    // Reset db on failure
    db = null;
    throw new Error(
      `Firestore initialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export function getFirestoreDB(): Firestore {
  if (!db) {
    throw new Error(
      "Firestore not initialized. Call initializeFirestore() first."
    );
  }
  return db;
}
