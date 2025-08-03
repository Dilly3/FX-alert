"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgErrorLogStore = void 0;
const model_1 = require("../../model/model");
class pgErrorLogStore {
    constructor(db) {
        this.db = db;
        this.errorLogRepository = this.db.getRepository(model_1.ErrorLog);
    }
    saveError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.errorLogRepository.save(error);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "unknown error";
                throw new Error(`failed to log error: ${message}`);
            }
        });
    }
}
exports.pgErrorLogStore = pgErrorLogStore;
