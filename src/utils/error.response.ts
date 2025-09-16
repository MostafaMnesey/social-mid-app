import { log } from "console";
import { Request, Response, NextFunction } from "express";
import { IError } from "./Types/interfaces";

export class ApplicationException extends Error {
  statusCode: number = 500;
  constructor(message: string, statusCode: number, cause?: unknown) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(message: string, cause?: unknown) {
    super(message, 404, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class BadRequestException extends ApplicationException {
  constructor(
    message: string,

    cause?: unknown
  ) {
    super(message, 400, cause);
  }
}
export class ConflictException extends ApplicationException {
  constructor(message: string, cause?: unknown) {
    super(message, 409, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ForbiddenException extends ApplicationException {
  constructor(message: string, cause?: unknown) {
    super(message, 403, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class UnauthorizedException extends ApplicationException {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(err.statusCode || 500).json({
    error: "Internal server error",
    Type: err.name,
    message: err.message,
    cause: err.cause,
    stack: process.env.APP_ENV === "development" ? err.stack : undefined,
  });
};
