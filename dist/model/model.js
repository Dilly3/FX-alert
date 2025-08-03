"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collection = exports.ErrorLog = exports.UserInfo = exports.CurrencyRate = exports.Currency = void 0;
const typeorm_1 = require("typeorm");
let Currency = class Currency {
};
exports.Currency = Currency;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ unique: true }),
    __metadata("design:type", String)
], Currency.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Currency.prototype, "name", void 0);
exports.Currency = Currency = __decorate([
    (0, typeorm_1.Entity)()
], Currency);
let CurrencyRate = class CurrencyRate {
};
exports.CurrencyRate = CurrencyRate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CurrencyRate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurrencyRate.prototype, "fromCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurrencyRate.prototype, "toCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CurrencyRate.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CurrencyRate.prototype, "alias", void 0);
exports.CurrencyRate = CurrencyRate = __decorate([
    (0, typeorm_1.Entity)()
], CurrencyRate);
let UserInfo = class UserInfo {
};
exports.UserInfo = UserInfo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], UserInfo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserInfo.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserInfo.prototype, "baseCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Array)
], UserInfo.prototype, "targetCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], UserInfo.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], UserInfo.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserInfo.prototype, "verificationPin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], UserInfo.prototype, "pinExpiryTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], UserInfo.prototype, "isVerified", void 0);
exports.UserInfo = UserInfo = __decorate([
    (0, typeorm_1.Entity)()
], UserInfo);
let ErrorLog = class ErrorLog {
};
exports.ErrorLog = ErrorLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ErrorLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ErrorLog.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ErrorLog.prototype, "createdAt", void 0);
exports.ErrorLog = ErrorLog = __decorate([
    (0, typeorm_1.Entity)()
], ErrorLog);
var collection;
(function (collection) {
    collection["CURRENCY"] = "currencies";
    collection["USER"] = "users";
    collection["ERROR_LOG"] = "error_logs";
})(collection || (exports.collection = collection = {}));
