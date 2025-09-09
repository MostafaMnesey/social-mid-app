"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.Gender = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
var Gender;
(function (Gender) {
    Gender["male"] = "male";
    Gender["female"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["admin"] = "admin";
})(Role || (exports.Role = Role = {}));
const userSchema = new mongoose_2.Schema({
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
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
userSchema
    .virtual("username")
    .set(function (values) {
    const [firstName, lastName] = values.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
const UserModel = mongoose_1.models.User || (0, mongoose_2.model)("User", userSchema);
exports.default = UserModel;
