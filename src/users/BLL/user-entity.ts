import { randomUUID } from "crypto";
import { appConfig } from "../../core/config/appConfig";

export class User {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public createdAt = new Date().toISOString(),
    public expirationDate: string | null = null,
    public confirmationCode: string | null = null,
    public isConfirmed: boolean = true,
  ) {}

  public get isEmailConfirmationCodeExpired(): boolean {
    return this.expirationDate
      ? new Date(this.expirationDate!) < new Date()
      : false;
  }

  public emailConfirmed(value: boolean) {
    this.isConfirmed = value;

    return this;
  }

  public generateNewConfirmationCode(): this {
    this.confirmationCode = randomUUID();
    this.expirationDate = new Date(
      Date.now() + appConfig.EMAIL_CONFIRMATION_TIME * 1000,
    ).toISOString();

    return this;
  }
}
