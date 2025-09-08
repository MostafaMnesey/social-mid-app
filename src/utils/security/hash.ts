import { hash, compare } from "bcrypt";

export const generateHash = async (
  plainText: string,
  saltRound: number = Number(process.env.SALT_ROUND)
): Promise<string> => {
  return await hash(plainText, saltRound);
};

export const compareHash = async (
  plainText: string,
  hashText: string
): Promise<boolean> => {
  return await compare(plainText, hashText);
};
