import { JwtPayload } from "jsonwebtoken";
import { Gender, HydUserDoc, Role } from "../../DB/models/user";
import Mail from "nodemailer/lib/mailer";
import type { Request } from "express";

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

  phone?: string;
  address?: string;
  gender: Gender;
  role: Role;

  createdAt: Date;
  updatedAt?: Date;
}

export interface IError extends Error {
  statusCode: number;
}

export interface IEmail extends Mail.Options {
  otp: string;
}
