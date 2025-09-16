import { JwtPayload } from "jsonwebtoken";
import { HydUserDoc } from "../../DB/models/user";

declare module "express-serve-static-core" {
  export interface Request {
    user?: HydUserDoc;
    decoded?: JwtPayload;
  }
}
