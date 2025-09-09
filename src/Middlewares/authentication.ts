import { decodeToken } from "../utils/security/token";
import { BadRequestException } from "../utils/error.response";
import type { NextFunction, Response } from "express";
import { IUserAuth } from "../utils/interfaces/interfaces";
export const authentication = () => {
  return async (req: IUserAuth, res: Response, next: NextFunction) => {
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
    });
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};
