"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const uuid_1 = require("uuid");
const generateOtp = () => (0, uuid_1.v4)().replaceAll(/\D/g, "").slice(0, 6);
exports.generateOtp = generateOtp;
