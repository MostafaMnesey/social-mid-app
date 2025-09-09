

import z from "zod";
import * as validator from "./auth.validation";

export type IloginDTO = z.infer<typeof validator.login.body>;
export type IsignupDTO = z.infer<typeof validator.signup.body>;
export type IConfirmEmailDTO = z.infer<typeof validator.ConfirmEmail.body>;
