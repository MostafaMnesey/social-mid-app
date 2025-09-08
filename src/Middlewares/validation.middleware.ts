import { log } from "console";
import type { Request, Response, NextFunction } from "express";
import { z, type ZodError, type ZodType } from "zod";
import { BadRequestException } from "../utils/error.response";
type KeyRequest = keyof Request;
type SchemaType = Partial<Record<KeyRequest, ZodType>>; // Replace 'any' with the actual type of your schema if available
type ValidationError = Array<{
  key: KeyRequest;
  errors: Array<{
    message: string;
    path: string | number | symbol | undefined;
  }>;
}>;
export const validation = (Schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationErrors: ValidationError = [];
    for (const key of Object.keys(Schema) as KeyRequest[]) {
      if (!Schema[key]) continue;
      const validationResult = Schema[key].safeParse(req[key]);
      const errors = validationResult.error as ZodError;
      if (!validationResult.success) {
        validationErrors.push({
          key,
          errors: errors.issues.map((issue) => ({
            message: issue.message,
            path: issue.path[0],
          })),
        });
      }
    }

    if (validationErrors.length) {
      throw new BadRequestException("Validation Error", {
        validationErrors,
      });
    }

    return next() as unknown as NextFunction;
  };
};

export const generalField = {
  username: z.string(),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  otp: z.string().regex(/^\d{6}$/g),
};
