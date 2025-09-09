"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.ConflictException = exports.BadRequestException = exports.NotFoundException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode = 500;
    constructor(message, statusCode, cause) {
        super(message, { cause });
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class NotFoundException extends ApplicationException {
    constructor(message, cause) {
        super(message, 404, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends ApplicationException {
    constructor(message, cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class ConflictException extends ApplicationException {
    constructor(message, cause) {
        super(message, 409, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ConflictException = ConflictException;
const globalErrorHandler = (err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        error: "Internal server error",
        Type: err.name,
        message: err.message,
        cause: err.cause,
        stack: process.env.APP_ENV === "development" ? err.stack : undefined,
    });
};
exports.globalErrorHandler = globalErrorHandler;
