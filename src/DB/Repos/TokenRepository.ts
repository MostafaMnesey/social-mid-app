import { Model } from "mongoose";
import { DBRepository } from "./DBRepository";
import type { IToken as TDOC } from "../../utils/Types/interfaces";

export class TokenRepository extends DBRepository<TDOC> {
  constructor(protected override readonly model: Model<TDOC>) {
    super(model);
  }
}
