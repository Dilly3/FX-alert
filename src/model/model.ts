import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "typeorm"

@Entity()
export class Currency {

    @PrimaryColumn()
    @Unique(['id'])
    id! : string
    @Column()
    code! : string
    @Column()
    name! : string
}
@Entity()
export class CurrencyRate {
    @PrimaryGeneratedColumn("uuid")
    id! : string
    @Column()
    fromCurrency! : string
    @Column()
    toCurrency! : string
    @Column()
    rate! : number
    @PrimaryColumn()
    alias! : string
}


@Entity()
export class UserInfo {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    email! : string

    @Column()
    baseCurrency! : string

    @Column()
    targetCurrency! : string

    @Column()
    createdAt! : Date

    @Column()
    updatedAt! : Date

    @Column()
    verificationPin! : string

    @Column()
    pinExpiryTime! : Date

    @Column()
    isVerified! : boolean
    
} 

export enum collection {
    CURRENCY = "currencies",
    USER = "users"
}
