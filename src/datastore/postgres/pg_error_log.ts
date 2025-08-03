import { DataSource, Repository } from "typeorm";
import { ErrorLog } from "../../model/model";
import { ErrorLogStore } from "../datastore";

export class pgErrorLogStore implements ErrorLogStore {
   private readonly errorLogRepository: Repository<ErrorLog>;

  constructor(private readonly db: DataSource) {
    this.errorLogRepository = this.db.getRepository(ErrorLog);
  }


  async saveError(error: ErrorLog): Promise<void> {
    try {
      await this.errorLogRepository.save(error);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      throw new Error(`failed to log error: ${message}`);
    }
  }




}