import { DocumentData, DocumentReference, Firestore } from "@google-cloud/firestore";
import { UserInfo } from "../../model/model";
import { collection } from "../../model/model";


export class User {

constructor(private db:Firestore){
}
async saveUser(user:UserInfo):Promise<DocumentReference<DocumentData>>{
return await this.db.collection(collection.USER).add(user)
}

}