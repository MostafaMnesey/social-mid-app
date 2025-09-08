"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_1 = __importDefault(require("./models/user"));
const DbConnection = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.MONGO_URL);
        user_1.default.syncIndexes();
        console.log("DB connected successfully✅");
        console.log(result.models);
    }
    catch (error) {
        console.log("Error in DB connection❌");
    }
};
exports.default = DbConnection;
