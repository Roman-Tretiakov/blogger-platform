import express from "express";
import dotenv from "dotenv";
import { setupApp } from "./setup-app";
import { runDB, runTokensDB } from "./db/mongo.db";
import { appConfig } from "./core/config/appConfig";

const bootstrap = async () => {
  dotenv.config();

  // создание приложения
  const app = express();
  app.set("trust proxy", true); // для корректной работы secure cookies при использовании прокси (например, при деплое на Heroku)
  setupApp(app);

  // порты приложения
  const PORT: number = appConfig.PORT || 5001;
  const DB_URL: string = appConfig.MONGO_DB_URL || "mongodb://0.0.0.0:27017";
  const TOKENS_DB_URL: string =
    appConfig.RT_MONGO_DB_URL || "mongodb://0.0.0.0:27020";

  await runDB(DB_URL);
  await runTokensDB(TOKENS_DB_URL);

  // запуск приложения
  const server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });

  server.keepAliveTimeout = 120000;
  server.headersTimeout = 121000;
  server.timeout = 120000;
};

bootstrap().catch(console.error);
