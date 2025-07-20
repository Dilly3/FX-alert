import * as admin from "firebase-admin";
import * as serviceAccount from "../../service-account-key.json";
import { DocumentData, DocumentReference, Firestore, WriteResult } from "@google-cloud/firestore";
import { currency } from "../model/model";


export enum collection {
    CURRENCY = "currencies",
    USER = "users"
}



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

const db:Firestore = admin.firestore();

export const getdb = ():Firestore => db



