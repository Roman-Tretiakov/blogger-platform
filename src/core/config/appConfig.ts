import { config } from "dotenv";

config();

export const appConfig = {
  PORT: process.env.PORT || 5001,
  MONGO_DB_URL: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET as string,
  AT_TOKEN_TIME: process.env.JWT_EXPIRES_IN as string,
  EMAIL_CONFIRMATION_TIME: process.env
    .EMAIL_CONFIRM_EXPIRES_IN as unknown as number,
  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
};
