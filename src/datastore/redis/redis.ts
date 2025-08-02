import { createClient, RedisClientType } from 'redis';
import { ConvertCurrencyRequest, ConvertCurrencyResponse, LiveRatesRequest, LiveRatesResponse } from '../../model/dtos';
import { LogError, LogInfo } from '../../logger/gcp_logger';

export class RedisClient {
    private client: RedisClientType;
    private readonly CACHE_TTL: number;
    private isUp: boolean;
    constructor(host: string, port: number, password: string, username: string, ttl: number) {
      
        const {client, CACHE_TTL, isUp} = this.connect(username, password, host, port, ttl); 
        this.client = client;
        this.CACHE_TTL = CACHE_TTL;
        this.isUp = isUp;
    }

    private connect(username : string, password : string, host : string, port : number, ttl : number) : {client : RedisClientType, CACHE_TTL : number, isUp : boolean} {
        let client : RedisClientType = null!;
        let isUp : boolean = false;
        let CACHE_TTL : number = 0;
        try {
            CACHE_TTL = ttl * 60 * 60 * 1000;
            client = createClient({
                username: username,
                password: password,
                socket: {
                    host: host,
                    port: port
                }
            });

            client.on('error', (error : Error) => {
                LogError('Redis connection error:', {error: error});
                isUp = false;
            });

            client.on('connect', () => {
                LogInfo('Redis connected successfully', {});
                isUp = true;
            });

            client.on('close', () => {
                LogInfo('Redis connection closed', {});
                isUp = false;
            });

            // Connect to Redis
            client.connect().then(() => {
                LogInfo('Redis connected successfully', {});
                isUp = true;
            }).catch((error: Error) => {
                LogError('Error connecting to Redis', error);
                isUp = false;
            });

            return {client, CACHE_TTL, isUp};
        } catch (error) {
            LogError('Error connecting to Redis', error);
            throw error;
        }
    }



    async setCurrencyRate(request : LiveRatesRequest , value : LiveRatesResponse) : Promise<void>
    {
        const cacheKey = `currency_rate_${request.base}_${request.currencies.join(',')}`;
        await this.set<LiveRatesResponse>(cacheKey, value);
    }

    async getCurrencyRate(request : LiveRatesRequest ) : Promise<LiveRatesResponse | null>
    {
        const cacheKey = `currency_rate_${request.base}_${request.currencies.join(',')}`;
        return await this.get<LiveRatesResponse>(cacheKey);
    }

    async deleteCurrencyRate(request : LiveRatesRequest)
    {
        const cacheKey = `currency_rate_${request.base}_${request.currencies.join(',')}`;
        await this.delete(cacheKey);
    }

async setConvertCurrency(request: ConvertCurrencyRequest, value : ConvertCurrencyResponse): Promise<void> {
 const cacheKey = `currency_rate_${request.from}_${request.to}_${request.amount}_${request.date}`;
        await this.set<ConvertCurrencyResponse>(cacheKey, value);
}

    async getConvertCurrency(request : ConvertCurrencyRequest) : Promise<ConvertCurrencyResponse | null>
    {
const cacheKey = `currency_rate_${request.from}_${request.to}_${request.amount}_${request.date}`;
return await this.get<ConvertCurrencyResponse>(cacheKey)
    }


    isConnected() : boolean {
        return this.isUp;
    }
private async get<T>(key: string): Promise<T | null> {
    const value: string | null = await this.client.get(key);
    if (!value) return null;
    
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        console.error('Failed to parse cached value:', error);
        return null;
    }
}

private async set<T>(key: string, value: T): Promise<void> {
    try {
        // Convert milliseconds to seconds
        const ttlSeconds = Math.floor(this.CACHE_TTL / 1000);
        await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
        console.error('Failed to set cache value:', error);
        throw error;
    }
}

    private async delete(key: string) {
        await this.client.del(key);
    }

 
}



