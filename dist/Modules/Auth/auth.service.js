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
const Enums_1 = require("../../utils/Types/Enums");
const Token_1 = __importDefault(require("../../DB/models/Token"));
const TokenRepository_1 = require("../../DB/Repos/TokenRepository");
const google_auth_library_1 = require("google-auth-library");
class AuthService {
    // Db model
    usermodel = new UserRepository_1.UserRepository(user_1.default);
    tokenmodel = new TokenRepository_1.TokenRepository(Token_1.default);
    constructor() { }
    // verify id token from google
    async verifyIdToken(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    }
    // ==================== AUTHENTICATION ====================
    // -------- Signup (System Provider) --------
    signup = async (req, res) => {
        // Extract user input
        const { username, email, password } = req.body;
        // Check if user already exists
        const checkUser = await this.usermodel.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser)
            throw new error_response_1.BadRequestException("User already exists");
        // Generate OTP and create user
        const otp = (0, otp_1.generateOtp)();
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
        // Send confirmation email
        Email_event_1.default.emit("EmailConfirmation", { to: email, otp });
        if (!user)
            throw new error_response_1.BadRequestException("User creation failed");
        return res.status(201).json({ message: "signup successful", data: user });
    };
    // -------- Login (System Provider) --------
    login = async (req, res) => {
        const { email, password } = req.body;
        // Find user by email
        const user = await this.usermodel.findOne({ filter: { email } });
        // Reject if google account
        if (user?.provider === Enums_1.provider.google) {
            throw new error_response_1.BadRequestException("Please login with google");
        }
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (!user.confirmedAt)
            throw new error_response_1.ConflictException("Email not confirmed");
        // Verify password
        if (!(await (0, hash_1.compareHash)(password, user.password))) {
            throw new error_response_1.BadRequestException("Invalid login credentials");
        }
        // Generate login tokens
        const tokens = await (0, token_1.createLoginTokens)(user);
        return res.status(200).json({ message: "login successful", tokens });
    };
    // -------- Confirm Email --------
    ConfirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        // Find user with OTP
        const user = await this.usermodel.findOne({
            filter: { email, confirmEmailOtp: { $exists: true } },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        // Verify OTP
        if (!(await (0, hash_1.compareHash)(otp, user.confirmEmailOtp))) {
            throw new error_response_1.BadRequestException("Invalid otp");
        }
        // Confirm email and clear OTP
        await this.usermodel.updateOne({
            filter: { email },
            update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: 1 } },
        });
        return res.status(200).json({ message: "Email confirmed successfully" });
    };
    // -------- Logout --------
    logout = async (req, res) => {
        const { flag } = req.body;
        const update = {};
        let statusCode = 200;
        // Logout from all devices
        if (flag === Enums_1.LoginFlag.all) {
            update.changeCredentialsTime = new Date();
        }
        else {
            // Logout only from current session
            await (0, token_1.revokeToken)(req.decoded);
            statusCode = 201;
        }
        await this.usermodel.updateOne({ filter: { _id: req?.user?._id }, update });
        return res.status(statusCode).json({ message: "user logged out" });
    };
    // ==================== GOOGLE AUTH ====================
    // -------- Signup with Google --------
    signupWithGoogle = async (req, res) => {
        const { idToken } = req.body;
        const { email, family_name, given_name, picture } = await this.verifyIdToken(idToken);
        // Check if user already exists
        const user = await this.usermodel.findOne({ filter: { email } });
        if (user) {
            if (user?.provider === Enums_1.provider.google)
                return this.loginWithGoogle(req, res);
            throw new error_response_1.BadRequestException("User already exists");
        }
        // Create new Google user
        const [newUser] = (await this.usermodel.create({
            data: [
                {
                    firstName: given_name,
                    lastName: family_name,
                    email: email,
                    picture: picture,
                    provider: Enums_1.provider.google,
                    confirmedAt: new Date(),
                },
            ],
        })) || [];
        if (!newUser)
            throw new error_response_1.BadRequestException("User creation failed");
        const credentials = await (0, token_1.createLoginTokens)(newUser);
        return res.status(201).json({ message: "signup successful", credentials });
    };
    // -------- Login with Google --------
    loginWithGoogle = async (req, res) => {
        const { idToken } = req.body;
        const { email } = await this.verifyIdToken(idToken);
        // Find confirmed Google user
        const user = await this.usermodel.findOne({
            filter: {
                email,
                provider: Enums_1.provider.google,
                confirmedAt: { $exists: true },
            },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        const credentials = await (0, token_1.createLoginTokens)(user);
        return res.status(200).json({ message: "login successful", credentials });
    };
    // ==================== PASSWORD RESET ====================
    // -------- Send Reset OTP --------
    sendResetOtp = async (req, res) => {
        const { email } = req.body;
        // Find confirmed user
        const user = await this.usermodel.findOne({
            filter: { email, confirmedAt: { $exists: true } },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        // Generate and store OTP
        const otp = (0, otp_1.generateOtp)();
        const updatedUser = await this.usermodel.updateOne({
            filter: { email },
            update: { resetPasswordOtp: await (0, hash_1.generateHash)(otp) },
        });
        if (!updatedUser.matchedCount)
            throw new error_response_1.BadRequestException("failed to send otp");
        // Send OTP by email
        Email_event_1.default.emit("ResetPassword", { to: email, otp });
        return res
            .status(200)
            .json({ message: "otp sent successful" });
    };
    // -------- Verify Reset OTP --------
    verifyResetOtp = async (req, res) => {
        const { email, otp } = req.body;
        // Find system user with reset OTP
        const user = await this.usermodel.findOne({
            filter: {
                email,
                resetPasswordOtp: { $exists: true },
                provider: Enums_1.provider.system,
            },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        // Verify OTP
        if (!(await (0, hash_1.compareHash)(otp, user.resetPasswordOtp))) {
            throw new error_response_1.BadRequestException("invalid otp");
        }
        return res.status(200).json({ message: "otp Matched" });
    };
    // -------- Reset Password --------
    resetPassword = async (req, res) => {
        const { email, otp, password } = req.body;
        // Find system user with reset OTP
        const user = await this.usermodel.findOne({
            filter: {
                email,
                resetPasswordOtp: { $exists: true },
                provider: Enums_1.provider.system,
            },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        // Validate OTP
        if (!(await (0, hash_1.compareHash)(otp, user.resetPasswordOtp))) {
            throw new error_response_1.BadRequestException("invalid otp");
        }
        // Update password and remove OTP
        const updatedUser = await this.usermodel.updateOne({
            filter: { email },
            update: {
                $set: {
                    changeCredentialsTime: new Date(),
                    password: await (0, hash_1.generateHash)(password),
                },
                $unset: { resetPasswordOtp: 1 },
            },
        });
        if (!updatedUser.matchedCount)
            throw new error_response_1.BadRequestException("failed to reset password");
        return res.status(200).json({ message: "password reset successful" });
    };
}
exports.default = new AuthService();
