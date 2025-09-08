import { log } from "console";
import z from "zod";
import { generalField } from "../../Middlewares/validation.middleware";

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
export const ConfirmEmail={
  body:z.strictObject({
    email:generalField.email,
    otp:generalField.otp
  })
}