import { Router } from "express";
import AuthService from "./auth.service";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./auth.validation";

import { authentication } from "../../Middlewares/authentication";
const router: Router = Router();

// Route for signing up a new user
router.post("/signup", validation(validators.signup), AuthService.signup);

// Route for confirming user email with OTP
router.patch(
  "/Confirm-Email",
  validation(validators.ConfirmEmail),
  AuthService.ConfirmEmail
);

// Route for logging in an existing user
router.post("/login", AuthService.login);

// Route for logging out a user (requires authentication)
router.post(
  "/logout",
  authentication(),
  validation(validators.logout),
  AuthService.logout
);

// Route for signing up with Google account
router.post(
  "/signupWithGoogle",
  validation(validators.signupWithGoogle),
  AuthService.signupWithGoogle
);

// Route for logging in with Google account
router.post(
  "/loginWithGoogle",
  validation(validators.signupWithGoogle),
  AuthService.loginWithGoogle
);

// Route for sending reset password OTP to the user’s email
router.post(
  "/send-reset-otp",
  validation(validators.sendResetOtp),
  AuthService.sendResetOtp
);

// Route for verifying the reset password OTP
router.post(
  "/verify-reset-otp",
  validation(validators.verifyResetOtp),
  AuthService.verifyResetOtp
);

// Route for resetting the password after OTP verification
router.patch(
  "/reset-Password",
  validation(validators.resetPassword),
  AuthService.resetPassword
);

export default router;
