import EventEmitter from "node:events";
import { send } from "node:process";
import { sendEmail } from "../Email/Email";
import { emailTemplte } from "../Email/mail.temp";


const event = new EventEmitter();

event.on("EmailConfirmation", (data) => {
  data.subject = "Email confirmation";
  data.html = emailTemplte({ title: "Email confirmation", otp: data.otp });

  sendEmail(data);
});
event.on("ResetPassword", (data) => {
  data.subject = "Reset Password";
  data.html = emailTemplte({ title: "Reset Password", otp: data.otp });
  sendEmail(data);
});

export default event;
