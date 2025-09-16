import { JwtPayload } from "jsonwebtoken";
import { HydUserDoc } from "../../DB/models/user";
import { Gender, provider, Role } from "../Types/Enums";
import Mail from "nodemailer/lib/mailer";
import type { Request } from "express";
import { Schema } from "mongoose";

export interface IUserAuth extends Request {
  user?: HydUserDoc;
  decoded?: JwtPayload;
}

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmailOtp?: string;
  confirmedAt?: Date;

  password: string;
  resetPasswordOtp?: string;
  changeCredentialsTime?: Date;
  provider: provider;

  phone?: string;
  address?: string;
  gender: Gender;
  role: Role;
  picture?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IError extends Error {
  statusCode: number;
}

export interface IEmail extends Mail.Options {
  otp: string;
}
export interface IToken {
  jti: string;
  expiresIn: number;
  userId: Schema.Types.ObjectId;
}
