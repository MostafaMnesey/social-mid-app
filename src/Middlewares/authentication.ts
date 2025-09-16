import { decodeToken } from "../utils/security/token";
import {
  BadRequestException,
  ForbiddenException,
} from "../utils/error.response";
import type { NextFunction, Response, Request } from "express";
import { TokenType, Role } from "../utils/Types/Enums";
import { v4 as uuid } from "uuid";

export const authentication = (tokenType: TokenType = TokenType.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization)
      throw new BadRequestException("Authorization header is required", {
        key: "authration",
        errors: [
          {
            message: "authration is required",
            path: "authration",
          },
        ],
      });
    const { user, decoded } = await decodeToken({
      authorization: req.headers.authorization as string,
      tokenType: tokenType,
    });
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = (
  accessRoles: Role[],
  tokenType: TokenType = TokenType.access
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization)
      throw new BadRequestException("Authorization header is required", {
        key: "authration",
        errors: [
          {
            message: "authration is required",
            path: "authration",
          },
        ],
      });
    const { user, decoded } = await decodeToken({
      authorization: req.headers.authorization as string,
      tokenType: tokenType,
    });
    if (!accessRoles.includes(user.role))
      throw new ForbiddenException(
        "You are not authorized to perform this action"
      );
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};
