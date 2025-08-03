"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const currency = {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦"
};
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.json({
        message: "Hello World"
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
