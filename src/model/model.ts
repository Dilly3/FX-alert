import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "typeorm"
@Entity()
export class Currency {
    @PrimaryColumn({unique: true})
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
    @Column({unique: true})
    alias! : string
}
@Entity()
export class UserInfo {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({unique: true})
    email! : string

    @Column()
    baseCurrency! : string

    @Column()
    targetCurrency! : string[]

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

@Entity()
export class ErrorLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    operation!: string;

    @Column()
    date!: Date;

    @Column()
    errorMessage!: string;

    @Column()
    createdAt!: Date;
}

export enum collection {
    CURRENCY = "currencies",
    USER = "users",
    ERROR_LOG = "error_logs"
}