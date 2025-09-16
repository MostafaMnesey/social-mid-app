import { HTokenDoc, TokenModel } from "./../../DB/models/Token";
import { sign, verify } from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import type { HydUserDoc } from "../../DB/models/user";
import UserModel from "../../DB/models/user";

import { BadRequestException, UnauthorizedException } from "../error.response";
import { UserRepository } from "../../DB/Repos/UserRepository";
import { Role, signturesLevelEnum, TokenType } from "../Types/Enums";
import { v4 as uuid } from "uuid";
import { TokenRepository } from "../../DB/Repos/TokenRepository";

export const generateToken = ({
  payload,
  secret = process.env.JWT_SECRET_USER as string,
  options = { expiresIn: Number(process.env.JWT_EXPIRES_IN_ACCESS) },
}: {
  payload: object;
  secret?: Secret;
  options?: SignOptions;
}) => {
  return sign(payload, secret, options);
};
export const verifyToken: ({
  token,
  secret,
}: {
  token: string;
  secret?: Secret;
}) => Promise<JwtPayload> = async ({
  token,
  secret = process.env.JWT_SECRET_USER as string,
}: {
  token: string;
  secret?: Secret;
}): Promise<JwtPayload> => {
  return verify(token, secret) as JwtPayload;
};
export const signturesLevel = async (
  role: Role = Role.user
): Promise<signturesLevelEnum> => {
  let signturesLevel = signturesLevelEnum.Bearer;

  switch (role) {
    case Role.admin:
      signturesLevel = signturesLevelEnum.system;
      break;

    default:
      signturesLevel = signturesLevelEnum.Bearer;

      break;
  }
  return signturesLevel;
};

const model = new UserRepository(UserModel);
const TModel = new TokenRepository(TokenModel);
export const getSignatures = async (
  signturesLevel: signturesLevelEnum = signturesLevelEnum.Bearer
) => {
  let signtures = { access: "", refresh: "" };

  switch (signturesLevel) {
    case signturesLevelEnum.system:
      signtures = {
        access: process.env.JWT_SECRET_ADMIN as string,
        refresh: process.env.JWT_SECRET_REFRESH_ADMIN_TOKEN as string,
      };
      break;
    default:
      signtures = {
        access: process.env.JWT_SECRET_USER as string,
        refresh: process.env.JWT_SECRET_REFRESH_USER_TOKEN as string,
      };
      break;
  }
  return signtures;
};

export const createLoginTokens = async (user: HydUserDoc) => {
  const userType = await signturesLevel(user.role);

  const { access, refresh } = await getSignatures(userType);
  console.log({
    access: process.env.JWT_EXPIRES_IN_ACCESS,
    refresh: process.env.JWT_EXPIRES_IN_REFRESH,
  });

  const AccessToken = generateToken({
    payload: { _id: user._id },
    secret: access,
    options: {
      expiresIn: Number(process.env.JWT_EXPIRES_IN_ACCESS),
      jwtid: uuid(),
    },
  });
  const refreshToken = generateToken({
    payload: { _id: user._id },
    secret: refresh,
    options: {
      expiresIn: Number(process.env.JWT_EXPIRES_IN_REFRESH),
      jwtid: uuid(),
    },
  });
  return { AccessToken, refreshToken };
};

export const decodeToken = async ({
  authorization,
  tokenType = TokenType.access,
}: {
  authorization: string;
  tokenType?: TokenType;
}) => {
  const [Bearer, token] = authorization.split(" ");

  if (!token || !Bearer) {
    throw new BadRequestException("Validation Error", {
      key: "authration",
      errors: [
        {
          message: "authration is required",
          path: "authration",
        },
      ],
    });
  }
  const signature = await getSignatures(Bearer as signturesLevelEnum);

  const decoded = await verifyToken({
    token,
    secret:
      tokenType === TokenType.access ? signature.access : signature.refresh,
  });

  if (!decoded.iat || !decoded._id) {
    throw new BadRequestException("Validation Error", {
      key: "authration",
      errors: [
        {
          message: "authration is invalid",
          path: "authration",
        },
      ],
    });
  }

  if (await TModel.findOne({ filter: { jti: decoded?.jti } })) {
    throw new UnauthorizedException("Validation Error", {
      key: "authration",
      errors: [
        {
          message: "authration is invalid",
          path: "authration",
        },
      ],
    });
  }
  const user = await model.findOne({
    filter: { _id: decoded?._id },
  })

  console.log(
    (user?.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000
  );
  if ((user?.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw new UnauthorizedException("Validation Error", {
      key: "authration",
      errors: [
        {
          message: "authration is invalid",
          path: "authration",
        },
      ],
    });
  }
  if (!user) {
    throw new BadRequestException("Validation Error", {
      key: "authration",
      errors: [
        {
          message: "authration is invalid",
          path: "authration",
        },
      ],
    });
  }

  return { user, decoded };
};

export const revokeToken = async (decoded: JwtPayload): Promise<HTokenDoc> => {
  const tokenModel = new TokenRepository(TokenModel);
  const [result] =
    (await tokenModel.create({
      data: [
        {
          jti: decoded?.jti as string,
          expiresIn:
            (decoded?.exp || 0) + Number(process.env.JWT_EXPIRES_IN_ACCESS),
          userId: decoded?._id,
        },
      ],
    })) || [];
  if (!result) {
    throw new BadRequestException("Cannot revoke token");
  }

  return result;
};
