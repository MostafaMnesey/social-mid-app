import { provider } from "./../../utils/Types/Enums";
import { HydratedDocument, models, Types } from "mongoose";
import { Schema, model } from "mongoose";

import { IUser } from "../../utils/Types/interfaces";
import { Gender, Role } from "../../utils/Types/Enums";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 3, maxLength: 30 },
    lastName: { type: String, required: true, minLength: 3, maxLength: 30 },

    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmedAt: { type: Date },

    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === provider.system;
      },
    },
    resetPasswordOtp: { type: String },
    changeCredentialsTime: { type: Date },
    provider: { type: String, enum: provider, default: provider.system },

    phone: { type: String },
    address: { type: String },

    gender: { type: String, enum: Gender, default: Gender.male },
    role: { type: String, enum: Role, default: Role.user },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema
  .virtual("username")
  .set(function (values: string) {
    const [firstName, lastName] = values.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

const UserModel = models.User || model<IUser>("User", userSchema);
export default UserModel;
export type HydUserDoc = HydratedDocument<IUser>;
