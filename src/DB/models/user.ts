import e from "cors";
import { models, Types } from "mongoose";
import { Schema, model } from "mongoose";
import en from "zod/v4/locales/en.cjs";
import { fi } from "zod/v4/locales/index.cjs";
enum Gender {
  male = "male",
  female = "female",
}
enum Role {
  user = "user",
  admin = "admin",
}

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;


  email: string;
  confirmEmailOtp?: string;
  confirmedAt?: Date;

  password: string;
  resetPasswordOtp?: string;
  changeCredentialsTime?: Date;

  phone?: string;
  address?: string;
  gender: Gender;
  role: Role;

  createdAt: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 3, maxLength: 30 },
    lastName: { type: String, required: true, minLength: 3, maxLength: 30 },

    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmedAt: { type: Date },

    password: { type: String, required: true },
    resetPasswordOtp: { type: String },
    changeCredentialsTime: { type: Date },

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
