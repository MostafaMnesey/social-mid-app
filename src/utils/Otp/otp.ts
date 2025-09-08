import { v4 as uuid } from "uuid";
export const generateOtp  = (): string =>
  uuid().replaceAll(/\D/g, "").slice(0, 6);
