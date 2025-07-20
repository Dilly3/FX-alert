
 
import express, { Request, Response } from 'express';
import { getdb } from './datastore/store';
import { Currency } from './datastore/currency_store';
require('dotenv').config()

const currency = {
    code : "NGN",
    name : "Nigerian Naira",
    symbol : "₦"
}



const app = express();
const port = process.env.PORT || 8080;

const db = getdb()
const currencyDb = new Currency(db)




app.get('/', (req: Request, res: Response) => {
  currencyDb.saveCurrency(currency).then((resp)=>{
    console.log("THIS IS THE RESP",resp.id)
res.json({
    message : "Currency saved",
    data : resp
})
}).catch((err)=>{
    console.log("THIS IS THE ERR",err)
        res.json({
            message : "Currency not saved",
            data : err
        })
})
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});