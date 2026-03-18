import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import { setupApp } from "./setup-app";
import { runDB } from "./db/mongo.db";
import { appConfig } from "./core/config/appConfig";

const bootstrap = async () => {
  dotenv.config();

  // порты приложения
  const PORT: number = appConfig.PORT || 5001;
  const DB_URL: string = appConfig.MONGO_DB_URL || "mongodb://0.0.0.0:27017";

  await runDB(DB_URL);

  // создание приложения
  const app = express();
  app.set("trust proxy", true); // для корректной работы secure cookies при использовании прокси (например, при деплое на Heroku)
  setupApp(app);

  // запуск приложения
  const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });

  server.keepAliveTimeout = 120000;
  server.headersTimeout = 121000;
  server.timeout = 120000;

  // Graceful shutdown — закрываем соединение при остановке
  process.on("SIGTERM", async () => {
    await mongoose.disconnect();
    server.close();
  });
};

bootstrap().catch(console.error);
