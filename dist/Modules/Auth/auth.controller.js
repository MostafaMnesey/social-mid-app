"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./auth.validation"));
const authentication_1 = require("../../Middlewares/authentication");
const router = (0, express_1.Router)();
// Route for signing up a new user
router.post("/signup", (0, validation_middleware_1.validation)(validators.signup), auth_service_1.default.signup);
// Route for confirming user email with OTP
router.patch("/Confirm-Email", (0, validation_middleware_1.validation)(validators.ConfirmEmail), auth_service_1.default.ConfirmEmail);
// Route for logging in an existing user
router.post("/login", auth_service_1.default.login);
// Route for logging out a user (requires authentication)
router.post("/logout", (0, authentication_1.authentication)(), (0, validation_middleware_1.validation)(validators.logout), auth_service_1.default.logout);
// Route for signing up with Google account
router.post("/signupWithGoogle", (0, validation_middleware_1.validation)(validators.signupWithGoogle), auth_service_1.default.signupWithGoogle);
// Route for logging in with Google account
router.post("/loginWithGoogle", (0, validation_middleware_1.validation)(validators.signupWithGoogle), auth_service_1.default.loginWithGoogle);
// Route for sending reset password OTP to the user’s email
router.post("/send-reset-otp", (0, validation_middleware_1.validation)(validators.sendResetOtp), auth_service_1.default.sendResetOtp);
// Route for verifying the reset password OTP
router.post("/verify-reset-otp", (0, validation_middleware_1.validation)(validators.verifyResetOtp), auth_service_1.default.verifyResetOtp);
// Route for resetting the password after OTP verification
router.patch("/reset-Password", (0, validation_middleware_1.validation)(validators.resetPassword), auth_service_1.default.resetPassword);
exports.default = router;
