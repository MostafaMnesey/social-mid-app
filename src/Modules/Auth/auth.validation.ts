import z from "zod";
import { generalField } from "../../Middlewares/validation.middleware";
import { LoginFlag } from "../../utils/Types/Enums";
import { id } from "zod/v4/locales/index.cjs";

export const login = {
  body: z
    .strictObject({
      username: generalField.username,
      email: generalField.email,
      password: generalField.password,
      confirmPassword: generalField.confirmPassword,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "passwords do not match",
          path: ["confirmPassword"],
        });
      }
      if (data.username.split(" ").length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "please provide first and last name",
          path: ["username"],
        });
      }
    }),
};

export const signup = {
  body: login.body
    .safeExtend({
      username: generalField.username,
      confirmPassword: generalField.confirmPassword,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }),
};
export const ConfirmEmail = {
  body: z.strictObject({
    email: generalField.email,
    otp: generalField.otp,
  }),
};

export const logout = {
  body: z.strictObject({
    flag: z.enum(LoginFlag).default(LoginFlag.only),
  }),
};

export const signupWithGoogle = {
  body: z.strictObject({
    idToken: z.string(),
  }),
};

export const sendResetOtp = {
  body: z.strictObject({
    email: generalField.email,
  }),
};
export const verifyResetOtp = {
  body: z.strictObject({
    email: generalField.email,
    otp: generalField.otp,
  }),
};
export const resetPassword = {
  body: verifyResetOtp.body
    .safeExtend({
      password: generalField.password,
      confirmPassword: generalField.confirmPassword,
    })
    .refine(
      (data) => {
        return data.password === data.confirmPassword;
      },
      {
        message: "passwords do not match",
        path: ["confirmPassword"],
      }
    ),
};
