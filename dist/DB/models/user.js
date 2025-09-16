"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Enums_1 = require("./../../utils/Types/Enums");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const Enums_2 = require("../../utils/Types/Enums");
const userSchema = new mongoose_2.Schema({
    firstName: { type: String, required: true, minLength: 3, maxLength: 30 },
    lastName: { type: String, required: true, minLength: 3, maxLength: 30 },
    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmedAt: { type: Date },
    password: {
        type: String,
        required: function () {
            return this.provider === Enums_1.provider.system;
        },
    },
    resetPasswordOtp: { type: String },
    changeCredentialsTime: { type: Date },
    provider: { type: String, enum: Enums_1.provider, default: Enums_1.provider.system },
    phone: { type: String },
    address: { type: String },
    gender: { type: String, enum: Enums_2.Gender, default: Enums_2.Gender.male },
    role: { type: String, enum: Enums_2.Role, default: Enums_2.Role.user },
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
