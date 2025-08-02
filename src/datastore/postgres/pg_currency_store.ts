import { DataSource, Repository } from "typeorm";
import { Currency } from "../../model/model";
import { CurrencyDataStore } from "../datastore";
import { RedisClient } from "../redis/redis";

export class PgCurrencyStore implements CurrencyDataStore {
    private readonly currencyRepository: Repository<Currency>;

    constructor(private readonly db: DataSource) {
        this.currencyRepository = this.db.getRepository(Currency);
    }

    async firstOrCreate(currency: Currency): Promise<Currency> {
        try {
            await this.currencyRepository.upsert(currency, { 
                conflictPaths: ['code'],
                skipUpdateIfNoValuesChanged: true 
            });  
            const result = await this.currencyRepository.findOne({
                where: { code: currency.code }
            });   
            if (!result) {
                throw new Error(`Failed to create or find currency with code: ${currency.code}`);
            }
            
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to firstOrCreate currency: ${error.message}`);
            }
            throw new Error(`Failed to firstOrCreate currency: ${error}`);
        }
    }

    async saveCurrency(currency: Currency): Promise<Currency> {
        try {
            return await this.currencyRepository.save(currency);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to save currency: ${error.message}`);
            }
            throw new Error(`Failed to save currency: ${error}`);
        }
    }

    async getCurrency(code: string): Promise<Currency | null> {
        try {
            return await this.currencyRepository.findOne({ 
                where: { code: code } 
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get currency with code ${code}: ${error.message}`);
            }
            throw new Error(`Failed to get currency with code ${code}: ${error}`);
        }
    }

    async updateCurrency(currency: Currency): Promise<Currency> {
        try {
            const updateResult = await this.currencyRepository.update(
                { code: currency.code }, 
                currency
            );
            if (updateResult.affected === 0) {
                throw new Error(`Currency with code ${currency.code} not found`);
            }

            const updatedCurrency = await this.currencyRepository.findOne({
                where: { code: currency.code }
            });

            if (!updatedCurrency) {
                throw new Error(`Failed to retrieve updated currency with code: ${currency.code}`);
            }

            return updatedCurrency;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update currency: ${error.message}`);
            }
            throw new Error(`Failed to update currency: ${error}`);
        }
    }

    async deleteCurrency(code: string): Promise<void> {
        try {
            const deleteResult = await this.currencyRepository.delete({ code });
            
            if (deleteResult.affected === 0) {
                throw new Error(`Currency with code ${code} not found`);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete currency with code ${code}: ${error.message}`);
            }
            throw new Error(`Failed to delete currency with code ${code}: ${error}`);
        }
    }
    async getAllCurrencies(): Promise<Currency[]> {
        try {
            return await this.currencyRepository.find({
                order: { code: 'ASC' }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get all currencies: ${error.message}`);
            }
            throw new Error(`Failed to get all currencies: ${error}`);
        }
    }

    async bulkUpsert(currencies: Currency[]): Promise<void> {
        try {
            await this.currencyRepository.upsert(currencies, {
                conflictPaths: ['code'],
                skipUpdateIfNoValuesChanged: true
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to bulk upsert currencies: ${error.message}`);
            }
            throw new Error(`Failed to bulk upsert currencies: ${error}`);
        }
    }

}