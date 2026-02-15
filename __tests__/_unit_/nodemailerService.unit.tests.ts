import { nodemailerService } from "../../src/auth/adapters/emailSendler/nodemailer.service";
import { MailServices } from "../../src/auth/adapters/enums/mail-services";
import { emailExamples } from "../../src/auth/adapters/emailSendler/emailExamples";

describe("nodemailerService test", () => {
  test("should send an email successfully", async () => {
    // Добавьте async здесь
    const result = await nodemailerService.sendEmail(
      MailServices.MAIL_RU,
      "thalamus.rus@mail.ru", // кому отправляем
      "123456", // код подтверждения
      emailExamples.registrationEmail, // шаблон
    );

    if (result) {
      console.log("✅ Письмо отправлено успешно");
    } else {
      console.log("❌ Ошибка при отправке");
    }

    expect(result).toBe(true);
  });
});
