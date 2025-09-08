"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalField = exports.validation = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/error.response");
const validation = (Schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(Schema)) {
            if (!Schema[key])
                continue;
            const validationResult = Schema[key].safeParse(req[key]);
            const errors = validationResult.error;
            if (!validationResult.success) {
                validationErrors.push({
                    key,
                    errors: errors.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path[0],
                    })),
                });
            }
        }
        if (validationErrors.length) {
            throw new error_response_1.BadRequestException("Validation Error", {
                validationErrors,
            });
        }
        return next();
    };
};
exports.validation = validation;
exports.generalField = {
    username: zod_1.z.string(),
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6),
    confirmPassword: zod_1.z.string().min(6),
    otp: zod_1.z.string().regex(/^\d{6}$/g),
};
