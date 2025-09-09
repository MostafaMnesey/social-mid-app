"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../utils/error.response");
const user_1 = __importDefault(require("../../DB/models/user"));
const UserRepository_1 = require("../../DB/Repos/UserRepository");
const hash_1 = require("../../utils/security/hash");
const Email_event_1 = __importDefault(require("../../utils/Events/Email.event"));
const otp_1 = require("../../utils/Otp/otp");
const token_1 = require("../../utils/security/token");
class AuthService {
    // Db model
    usermodel = new UserRepository_1.UserRepository(user_1.default);
    constructor() { }
    // signup service
    signup = async (req, res) => {
        // Destructuring
        const { username, email, password } = req.body;
        // check if user already exists
        const checkUser = await this.usermodel.findOne({
            filter: { email },
            select: "email",
        });
        // if user already exists
        if (checkUser) {
            throw new error_response_1.BadRequestException("User already exists");
        }
        // generate otp
        const otp = (0, otp_1.generateOtp)();
        // create user
        const [user] = (await this.usermodel.create({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_1.generateHash)(password),
                    confirmEmailOtp: String(await (0, hash_1.generateHash)(otp)),
                },
            ],
            options: { validateBeforeSave: true },
        })) || [];
        // send email
        Email_event_1.default.emit("EmailConfirmation", { to: email, otp });
        // if user not created
        if (!user) {
            throw new error_response_1.BadRequestException("User creation failed");
        }
        // return user
        return res.status(201).json({ message: "signup successful", data: user });
    };
    // login service
    login = async (req, res) => {
        // Destructuring
        const { email, password } = req.body;
        const user = await this.usermodel.findOne({
            filter: { email },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("User not found");
        }
        if (!user.confirmedAt) {
            throw new error_response_1.ConflictException("Email not confirmed");
        }
        if (!(await (0, hash_1.compareHash)(password, user.password))) {
            throw new error_response_1.BadRequestException("Invalid password");
        }
        const tokens = await (0, token_1.createLoginTokens)(user);
        return res.status(200).json({
            message: "login successful",
            tokens,
        });
    };
    ConfirmEmail = async (req, res) => {
        // Destructuring
        const { email, otp } = req.body;
        const user = await this.usermodel.findOne({
            filter: { email, confirmEmailOtp: { $exists: true } },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("User not found");
        }
        if (!(await (0, hash_1.compareHash)(otp, user.confirmEmailOtp))) {
            throw new error_response_1.BadRequestException("Invalid otp");
        }
        await this.usermodel.updateOne({
            filter: { email },
            update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: 1 } },
        });
        return res.status(200).json({ message: "Email confirmed successfully" });
    };
    user = async (req, res) => {
        return res.status(200).json({ message: "user", data: req.user });
    };
}
exports.default = new AuthService();
