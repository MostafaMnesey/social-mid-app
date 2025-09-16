import type { Request, Response } from "express";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/error.response";
import {
  IConfirmEmailDTO,
  IGoogleDTO,
  IloginDTO,
  IlogoutDTO,
  IResetPasswordDTO,
  ISendResetOtpDTO,
  IsignupDTO,
  IVerifyResetOtpDTO,
} from "./auth.dto";
import UserModel from "../../DB/models/user";
import { UserRepository } from "../../DB/Repos/UserRepository";
import { compareHash, generateHash } from "../../utils/security/hash";
import event from "../../utils/Events/Email.event";
import { generateOtp } from "../../utils/Otp/otp";
import {
  createLoginTokens,
  generateToken,
  revokeToken,
} from "../../utils/security/token";
import { LoginFlag, provider } from "../../utils/Types/Enums";
import { IUser as TDoc } from "../../utils/Types/interfaces";
import { UpdateQuery } from "mongoose";
import TokenModel, { HTokenDoc } from "../../DB/models/Token";
import { TokenRepository } from "../../DB/Repos/TokenRepository";
import { OAuth2Client, type TokenPayload } from "google-auth-library";

class AuthService {
  // Db model
  private usermodel = new UserRepository(UserModel);
  private tokenmodel = new TokenRepository(TokenModel);
  constructor() {}
  // verify id token from google
  private async verifyIdToken(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID as string,
    });
    const payload = ticket.getPayload();
    return payload as TokenPayload;
  }

  // ==================== AUTHENTICATION ====================

  // -------- Signup (System Provider) --------
  signup = async (req: Request, res: Response): Promise<Response> => {
    // Extract user input
    const { username, email, password }: IsignupDTO = req.body;

    // Check if user already exists
    const checkUser = await this.usermodel.findOne({
      filter: { email },
      select: "email",
    });
    if (checkUser) throw new BadRequestException("User already exists");

    // Generate OTP and create user
    const otp = generateOtp();
    const [user] =
      (await this.usermodel.create({
        data: [
          {
            username,
            email,
            password: await generateHash(password),
            confirmEmailOtp: String(await generateHash(otp)),
          },
        ],
        options: { validateBeforeSave: true },
      })) || [];

    // Send confirmation email
    event.emit("EmailConfirmation", { to: email, otp });

    if (!user) throw new BadRequestException("User creation failed");
    return res.status(201).json({ message: "signup successful", data: user });
  };

  // -------- Login (System Provider) --------
  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: IloginDTO = req.body;

    // Find user by email
    const user = await this.usermodel.findOne({ filter: { email } });

    // Reject if google account
    if (user?.provider === provider.google) {
      throw new BadRequestException("Please login with google");
    }
    if (!user) throw new NotFoundException("User not found");
    if (!user.confirmedAt) throw new ConflictException("Email not confirmed");

    // Verify password
    if (!(await compareHash(password, user.password as string))) {
      throw new BadRequestException("Invalid login credentials");
    }

    // Generate login tokens
    const tokens = await createLoginTokens(user);
    return res.status(200).json({ message: "login successful", tokens });
  };

  // -------- Confirm Email --------
  ConfirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    // Find user with OTP
    const user = await this.usermodel.findOne({
      filter: { email, confirmEmailOtp: { $exists: true } },
    });
    if (!user) throw new NotFoundException("User not found");

    // Verify OTP
    if (!(await compareHash(otp, user.confirmEmailOtp as string))) {
      throw new BadRequestException("Invalid otp");
    }

    // Confirm email and clear OTP
    await this.usermodel.updateOne({
      filter: { email },
      update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: 1 } },
    });

    return res.status(200).json({ message: "Email confirmed successfully" });
  };

  // -------- Logout --------
  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: IlogoutDTO = req.body;
    const update: UpdateQuery<TDoc> = {};
    let statusCode: number = 200;

    // Logout from all devices
    if (flag === LoginFlag.all) {
      update.changeCredentialsTime = new Date();
    } else {
      // Logout only from current session
      await revokeToken(req.decoded as HTokenDoc);
      statusCode = 201;
    }

    await this.usermodel.updateOne({ filter: { _id: req?.user?._id }, update });
    return res.status(statusCode).json({ message: "user logged out" });
  };

  // ==================== GOOGLE AUTH ====================

  // -------- Signup with Google --------
  signupWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: IGoogleDTO = req.body;
    const { email, family_name, given_name, picture } =
      await this.verifyIdToken(idToken);

    // Check if user already exists
    const user = await this.usermodel.findOne({ filter: { email } });
    if (user) {
      if (user?.provider === provider.google)
        return this.loginWithGoogle(req, res);
      throw new BadRequestException("User already exists");
    }

    // Create new Google user
    const [newUser] =
      (await this.usermodel.create({
        data: [
          {
            firstName: given_name as string,
            lastName: family_name as string,
            email: email as string,
            picture: picture as string,
            provider: provider.google,
            confirmedAt: new Date(),
          },
        ],
      })) || [];

    if (!newUser) throw new BadRequestException("User creation failed");

    const credentials = await createLoginTokens(newUser);
    return res.status(201).json({ message: "signup successful", credentials });
  };

  // -------- Login with Google --------
  loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: IGoogleDTO = req.body;
    const { email } = await this.verifyIdToken(idToken);

    // Find confirmed Google user
    const user = await this.usermodel.findOne({
      filter: {
        email,
        provider: provider.google,
        confirmedAt: { $exists: true },
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const credentials = await createLoginTokens(user);
    return res.status(200).json({ message: "login successful", credentials });
  };

  // ==================== PASSWORD RESET ====================

  // -------- Send Reset OTP --------
  sendResetOtp = async (req: Request, res: Response): Promise<Response> => {
    const { email }: ISendResetOtpDTO = req.body;

    // Find confirmed user
    const user = await this.usermodel.findOne({
      filter: { email, confirmedAt: { $exists: true } },
    });
    if (!user) throw new NotFoundException("User not found");

    // Generate and store OTP
    const otp = generateOtp();
    const updatedUser = await this.usermodel.updateOne({
      filter: { email },
      update: { resetPasswordOtp: await generateHash(otp) },
    });

    if (!updatedUser.matchedCount)
      throw new BadRequestException("failed to send otp");

    // Send OTP by email
    event.emit("ResetPassword", { to: email, otp });
    return res
      .status(200)
      .json({ message: "otp sent successful" });
  };

  // -------- Verify Reset OTP --------
  verifyResetOtp = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IVerifyResetOtpDTO = req.body;

    // Find system user with reset OTP
    const user = await this.usermodel.findOne({
      filter: {
        email,
        resetPasswordOtp: { $exists: true },
        provider: provider.system,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    // Verify OTP
    if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
      throw new BadRequestException("invalid otp");
    }

    return res.status(200).json({ message: "otp Matched" });
  };

  // -------- Reset Password --------
  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp, password }: IResetPasswordDTO = req.body;

    // Find system user with reset OTP
    const user = await this.usermodel.findOne({
      filter: {
        email,
        resetPasswordOtp: { $exists: true },
        provider: provider.system,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    // Validate OTP
    if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
      throw new BadRequestException("invalid otp");
    }

    // Update password and remove OTP
    const updatedUser = await this.usermodel.updateOne({
      filter: { email },
      update: {
        $set: {
          changeCredentialsTime: new Date(),
          password: await generateHash(password),
        },
        $unset: { resetPasswordOtp: 1 },
      },
    });

    if (!updatedUser.matchedCount)
      throw new BadRequestException("failed to reset password");

    return res.status(200).json({ message: "password reset successful" });
  };
}

export default new AuthService();
