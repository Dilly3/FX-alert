import { Firestore, DocumentReference, DocumentData } from "@google-cloud/firestore";
import { currency } from "../model/model";
import { collection } from "../model/model";

export class Currency {
constructor(private db:Firestore){
}

async saveCurrency(currency:currency):Promise<DocumentReference<DocumentData>>{
return await this.db.collection(collection.CURRENCY).add(currency)
}

async saveCurrencies(currencies: currency[]): Promise<DocumentReference<DocumentData>[]> {
  try {
    const batch = this.db.batch();
    const results: DocumentReference<DocumentData>[] = [];
    
    currencies.forEach(currency => {
      const docRef = this.db.collection(collection.CURRENCY).doc();
      batch.set(docRef, currency);
      results.push(docRef);
    });
    
    await batch.commit();
    console.log(`Successfully saved ${currencies.length} currencies`);
    return results;
  } catch (error) {
    console.error('Error saving currency array:', error);
    throw error;
  }
}

async saveCurrenciesWithCustomIDs(currencies: currency[]): Promise<DocumentReference<DocumentData>[]> {
  try {
    const batch = this.db.batch();
    const results: DocumentReference<DocumentData>[] = [];
    
    currencies.forEach(currency => {
      // Use currency code as document ID
      const docRef = this.db.collection(collection.CURRENCY).doc(currency.code);
      batch.set(docRef, currency);
      results.push(docRef);
    });
    
    await batch.commit();
    console.log(`Successfully saved ${currencies.length} currencies`);
    return results;
  } catch (error) {
    console.error('Error saving currencies:', error);
    throw error;
  }
}

}