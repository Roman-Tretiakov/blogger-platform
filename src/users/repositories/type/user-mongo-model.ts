import { EmailConfirmation } from "../../../auth/adapters/emailSendler/types/email-confirmation";

export type UserMongoModel = {
  login: string;
  email: string;
  password: string;
  createdAt: string;
} & Partial<EmailConfirmation>; // Использовал "пересечение типов" для расширения существующего типа, чтобы в модели юзера были поля для подтверждения почты, а не создавать отдельную модель для этого.
// Partial - делает все поля в типе необязательными, так как не все юзеры будут иметь эти поля, например, создаваемые админом.
