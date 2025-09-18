import en from "zod/v4/locales/en.cjs";

export enum Gender {
  male = "male",
  female = "female",
}
export enum Role {
  user = "user",
  admin = "admin",
}
export enum signturesLevelEnum {
  system = "System",
  Bearer = "Bearer",
}
export enum TokenType {
  access = "access",
  refresh = "refresh",
}

export enum LoginFlag {
  only = "only",
  all = "all",
}

export enum provider {
  google = "google",
  system = "system",
}

export enum StorageEnum {
  memory = "memory",
  disk = "disk",
}
