import nodemailer from "nodemailer";
import { appConfig } from "../../../core/config/appConfig";
import { MailServices } from "../enums/mail-services";

export const nodemailerService = {
  async sendEmail(
    provider: MailServices,
    email: string,
    code: string,
    template: (code: string) => string,
  ): Promise<boolean> {
    try {
      let transporter = nodemailer.createTransport({
        service: provider,
        auth: {
          user: appConfig.EMAIL,
          pass: appConfig.EMAIL_PASS,
        },
      });
      let info = await transporter.sendMail({
        from: `"Kek 👻" <${appConfig.EMAIL}>`,
        to: email,
        subject: "Your code is here",
        html: template(code),
      });
      console.log(
        "Email sent successfully to %s. Message ID: %s",
        email,
        info.messageId,
      );
      return true;
    } catch (error) {
      console.error("Failed to send email to %s:", email, error);
      return false;
    }
  },
};
