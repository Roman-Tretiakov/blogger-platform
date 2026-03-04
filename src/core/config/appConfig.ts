import { config } from "dotenv";

config();

export const appConfig = {
  PORT: process.env.PORT as unknown as number,
  MONGO_DB_URL: process.env.MONGODB_URI,
  RT_MONGO_DB_URL: process.env.RT_TOKENS_MONGODB_URI,
  AT_TOKEN_SECRET: process.env.JWT_AT_SECRET as string,
  RT_TOKEN_SECRET: process.env.JWT_RT_SECRET as string,
  AT_TOKEN_TIME: process.env.JWT_AT_EXPIRES_IN as unknown as number,
  RT_TOKEN_TIME: process.env.JWT_RT_EXPIRES_IN as unknown as number,
  EMAIL_CONFIRMATION_TIME: process.env
    .EMAIL_CONFIRM_EXPIRES_IN as unknown as number,
  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,

  TTL_INDEX_MONGO_DB_TIME: 1 * 60 * 1000, // Время в миллисекундах, через которое MongoDB удалит документ с истекшим сроком действия (TTL индекс)
  RATE_LIMITER_WINDOW_MS: 1 * 10 * 1000, // Время в миллисекундах, которое определяет окно для подсчета количества запросов в рамках rate limiter (например, 15 минут)
  RATE_LIMIT_MAX_REQUESTS: 5, // Максимальное количество запросов, разрешенных в рамках одного окна для одного IP-адреса
};
