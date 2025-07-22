import { DataSource } from "typeorm";
import { Currency } from "../../model/model";

export class pg_currency_store {
    constructor(private db: DataSource) {
    }

    async saveCurrency(currency:Currency){
        const currencyRepository = this.db.getRepository(Currency)
        await currencyRepository.save(currency)
    }

    async getCurrency(code:string){
        const currencyRepository = this.db.getRepository(Currency)
        return await currencyRepository.findOne({where:{code}})
    }

    async updateCurrency(currency:Currency){
        const currencyRepository = this.db.getRepository(Currency)
        await currencyRepository.update(currency.code, currency)
    }

    async deleteCurrency(code:string){
        const currencyRepository = this.db.getRepository(Currency)
        await currencyRepository.delete(code)
    }
}