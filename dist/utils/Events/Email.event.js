"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = __importDefault(require("node:events"));
const Email_1 = require("../Email/Email");
const mail_temp_1 = require("../Email/mail.temp");
const event = new node_events_1.default();
event.on("EmailConfirmation", (data) => {
    data.subject = "Email confirmation";
    data.html = (0, mail_temp_1.emailTemplte)({ title: "Email confirmation", otp: data.otp });
    (0, Email_1.sendEmail)(data);
});
exports.default = event;
