

export type currency = {
code : string
name : string
}

export type userInfo = {
    firstName : string
    lastName: string
    email : string
   fromCurrency : string
   toCurrency : string
} 

export enum collection {
    CURRENCY = "currencies",
    USER = "users"
}
