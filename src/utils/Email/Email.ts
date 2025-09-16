import { createTransport, type Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BadRequestException } from "../error.response";
import { log } from "node:console";
import { IEmail } from "../Types/interfaces";

export const sendEmail = async (data: IEmail): Promise<void> => {
  if (!data.to && !data.attachments?.length && !data.html && !data.text)
    throw new BadRequestException("missing to or attachment");
  const transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  > = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL as string,
      pass: process.env.PASSWORD as string,
    },
  });
  const info = await transporter.sendMail({
    ...data,
    from: `'"${process.env.APP_NAME} 😈" <${process.env.EMAIL}>'`,
  });

  console.log("Message sent:", info.messageId);
};
