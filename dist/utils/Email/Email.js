"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const error_response_1 = require("../error.response");
const sendEmail = async (data) => {
    if (!data.to && !data.attachments?.length && !data.html && !data.text)
        throw new error_response_1.BadRequestException("missing to or attachment");
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        ...data,
        from: `'"${process.env.APP_NAME} 😈" <${process.env.EMAIL}>'`,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
