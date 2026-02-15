import { randomUUID } from "crypto";
import { appConfig } from "../../core/config/appConfig";
import { EmailConfirmation } from "../../auth/adapters/emailSendler/types/email-confirmation";

export class User {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public createdAt = new Date().toISOString(),
    public emailConfirmation: EmailConfirmation = {
      expirationDate: new Date(
        Date.now() + appConfig.EMAIL_CONFIRMATION_TIME * 1000,
      ).toISOString(),
      confirmationCode: randomUUID(),
      isConfirmed: false,
    },
  ) {}
}
