interface IEmailService {
  sendEmail(
    provider: string,
    email: string,
    code: string,
    template: any,
  ): Promise<void | boolean>;
}
