"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmEmail = exports.signup = exports.login = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
exports.login = {
    body: zod_1.default
        .strictObject({
        username: validation_middleware_1.generalField.username,
        email: validation_middleware_1.generalField.email,
        password: validation_middleware_1.generalField.password,
        confirmPassword: validation_middleware_1.generalField.confirmPassword,
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "passwords do not match",
                path: ["confirmPassword"],
            });
        }
        if (data.username.split(" ").length < 2) {
            ctx.addIssue({
                code: "custom",
                message: "please provide first and last name",
                path: ["username"],
            });
        }
    }),
};
exports.signup = {
    body: exports.login.body
        .safeExtend({
        username: validation_middleware_1.generalField.username,
        confirmPassword: validation_middleware_1.generalField.confirmPassword,
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "passwords do not match",
                path: ["confirmPassword"],
            });
        }
    }),
};
exports.ConfirmEmail = {
    body: zod_1.default.strictObject({
        email: validation_middleware_1.generalField.email,
        otp: validation_middleware_1.generalField.otp
    })
};
