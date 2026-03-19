import { randomUUID } from "crypto";
import { appConfig } from "../../core/config/appConfig";

export class User {
  public emailConfirmation = {
    confirmationCode: "",
    expirationDate: "",
    isConfirmed: false,
  };

  public passwordRecovery = {
    recoveryCode: "",
    expirationDate: "",
  };

  constructor(
    public login: string,
    public email: string,
    public password: string,
    public createdAt = new Date().toISOString(),
  ) {}

  public isEmailConfirmationCodeExpired(): boolean {
    return this.emailConfirmation.expirationDate
      ? new Date(this.emailConfirmation.expirationDate!) < new Date()
      : false;
  }

  public isEmailConfirmed(value: boolean) {
    this.emailConfirmation.isConfirmed = value;

    return this;
  }

  public generateNewEmailConfirmation(): this {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = new Date(
      Date.now() + appConfig.EMAIL_CONFIRMATION_TIME * 1000,
    ).toISOString();

    return this;
  }
}
