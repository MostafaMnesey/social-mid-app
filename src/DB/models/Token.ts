import { HydratedDocument, model, models, Schema } from "mongoose";
// Update the path below to the correct location of your interfaces file
import type { IToken } from "../../utils/Types/interfaces";
const tokenSchema = new Schema<IToken>(
  {
    jti: { type: String, required: true, unique: true },
    expiresIn: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TokenModel = models.Token || model<IToken>("Token", tokenSchema);

export default TokenModel;
export type HTokenDoc = HydratedDocument<IToken>;
