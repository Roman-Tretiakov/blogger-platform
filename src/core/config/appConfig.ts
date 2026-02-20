import { config } from "dotenv";

config();

export const appConfig = {
  PORT: process.env.PORT || 5001,
  MONGO_DB_URL: process.env.MONGODB_URI,
  AT_TOKEN_SECRET: process.env.JWT_AT_SECRET as string,
  RT_TOKEN_SECRET: process.env.JWT_RT_SECRET as string,
  AT_TOKEN_TIME: process.env.JWT_AT_EXPIRES_IN as unknown as number,
  RT_TOKEN_TIME: process.env.JWT_RT_EXPIRES_IN as unknown as number,
  EMAIL_CONFIRMATION_TIME: process.env
    .EMAIL_CONFIRM_EXPIRES_IN as unknown as number,
  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
};
