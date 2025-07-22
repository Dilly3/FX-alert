import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm"

@Entity()
export class Currency {
    @PrimaryColumn()
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
    firstName! : string

    @Column()
    lastName!: string

    @Column()
    email! : string

    @Column()
    fromCurrency! : string

    @Column()
    toCurrency! : string

    @Column()
    preferences! : string
    
} 

export enum collection {
    CURRENCY = "currencies",
    USER = "users"
}
