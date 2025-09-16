import { sign } from "jsonwebtoken";
import z from "zod";
import * as validator from "./auth.validation";

export type IloginDTO = z.infer<typeof validator.login.body>;
export type IsignupDTO = z.infer<typeof validator.signup.body>;
export type IConfirmEmailDTO = z.infer<typeof validator.ConfirmEmail.body>;
export type IlogoutDTO = z.infer<typeof validator.logout.body>;
export type IGoogleDTO = z.infer<typeof validator.signupWithGoogle.body>;
export type ISendResetOtpDTO = z.infer<typeof validator.sendResetOtp.body>;
export type IVerifyResetOtpDTO = z.infer<typeof validator.verifyResetOtp.body>;
export type IResetPasswordDTO = z.infer<typeof validator.resetPassword.body>;
