import { randomUUID } from "crypto";
import { appConfig } from "../../core/config/appConfig";

export class User {
  public emailConfirmation = {
    confirmationCode: null as string | null,
    expirationDate: null as string | null,
    isConfirmed: false,
  };

  public passwordRecovery = {
    recoveryCode: null as string | null,
    expirationDate: null as string | null,
  };

  constructor(
    public login: string,
    public email: string,
    public password: string,
    public createdAt = new Date().toISOString(),
  ) {
    this.emailConfirmation.confirmationCode = null;
    this.emailConfirmation.expirationDate = null;
    this.emailConfirmation.isConfirmed = false;
    this.passwordRecovery.recoveryCode = null;
    this.passwordRecovery.expirationDate = null;
  }

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
