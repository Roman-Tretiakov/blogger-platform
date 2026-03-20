interface IEmailService {
  sendEmail(
    provider: string,
    email: string,
    code: string | null,
    template: any,
  ): Promise<void | boolean>;
}
