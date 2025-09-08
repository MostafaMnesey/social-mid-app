import type { Request, Response } from "express";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/error.response";
import { IConfirmEmailDTO, IloginDTO, IsignupDTO } from "./auth.dto";
import UserModel, { type IUser } from "../../DB/models/user";
import { UserRepository } from "../../DB/Repos/UserRepository";
import { compareHash, generateHash } from "../../utils/security/hash";
import event from "../../utils/Events/Email.event";
import { generateOtp } from "../../utils/Otp/otp";
class AuthService {
  // Db model
  private usermodel = new UserRepository(UserModel);
  constructor() {}
  // signup service
  signup = async (req: Request, res: Response): Promise<Response> => {
    // Destructuring
    const { username, email, password }: IsignupDTO = req.body;
    // check if user already exists
    const checkUser = await this.usermodel.findOne({
      filter: { email },
      select: "email",
    });
    // if user already exists
    if (checkUser) {
      throw new BadRequestException("User already exists");
    }
    // generate otp
    const otp = generateOtp();
    // create user
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
    // send email
    event.emit("EmailConfirmation", { to: email, otp });
    // if user not created
    if (!user) {
      throw new BadRequestException("User creation failed");
    }
    // return user
    return res.status(201).json({ message: "signup successful", data: user });
  };
  // login service
  login = (req: Request, res: Response): Response => {
    // Destructuring
    const { email, password }: IloginDTO = req.body;

    return res
      .status(200)
      .json({ message: "login successful", data: req.body });
  };
  ConfirmEmail = async (req: Request, res: Response): Promise<Response> => {
    // Destructuring
    const { email, otp }: IConfirmEmailDTO = req.body;
    const user = await this.usermodel.findOne({
      filter: { email, confirmEmailOtp: { $exists: true } },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!(await compareHash(otp, user.confirmEmailOtp as string))) {
      throw new BadRequestException("Invalid otp");
    }

    await this.usermodel.updateOne({
      filter: { email },
      update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: 1 } },
    });

    return res.status(200).json({ message: "Email confirmed successfully" });
  };
}

export default new AuthService();
