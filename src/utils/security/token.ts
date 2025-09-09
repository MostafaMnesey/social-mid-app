import { sign, verify } from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import type { HydUserDoc } from "../../DB/models/user";
import UserModel, { Role } from "../../DB/models/user";
import { access } from "fs";
import { log } from "console";
import { BadRequestException } from "../error.response";
import { UserRepository } from "../../DB/Repos/UserRepository";

export enum signturesLevelEnum {
  system = "system",
  Bearer = "Bearer",
}
export enum TokenType {
  access = "access",
  refresh = "refresh",
}

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
  log(userType);
  const { access, refresh } = await getSignatures(userType);
  log({ access, refresh });

  const AccessToken = generateToken({
    payload: { _id: user._id },
    secret: access,
  });
  const refreshToken = generateToken({
    payload: { _id: user._id },
    secret: refresh,
    options: {
      expiresIn: Number(process.env.JWT_EXPIRES_IN_REFRESH),
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
  console.log({ signature, tokenType });

  const decoded = await verifyToken({
    token,
    secret:
      tokenType === TokenType.access ? signature.access : signature.refresh,
  });
  console.log(decoded);

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

  const user = await model.findOne({
    filter: { _id: decoded._id },
  });

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
