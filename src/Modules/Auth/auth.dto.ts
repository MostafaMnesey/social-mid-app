/* export interface IloginDTO {
  email: string;
  password: string;
}

export interface IsignupDTO extends IloginDTO {
  username: string;
}
 */

import z from "zod";
import * as validator from "./auth.validation";

export type IloginDTO = z.infer<typeof validator.login.body>;
export type IsignupDTO = z.infer<typeof validator.signup.body>;
export type IConfirmEmailDTO = z.infer<typeof validator.ConfirmEmail.body>;
