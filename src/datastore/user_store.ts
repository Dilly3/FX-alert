import { DocumentData, DocumentReference, Firestore } from "@google-cloud/firestore";
import { userInfo } from "../model/model";
import { collection } from "../model/model";


export class User {

constructor(private db:Firestore){
}
async saveUser(user:userInfo):Promise<DocumentReference<DocumentData>>{
return await this.db.collection(collection.USER).add(user)
}

}