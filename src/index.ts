import express from "express";
import dotenv from "dotenv";
import { setupApp } from "./setup-app";
import { runDB, runTokensDB } from "./db/mongo.db";

const bootstrap = async () => {
  dotenv.config();

  // создание приложения
  const app = express();
  setupApp(app);

  // порты приложения
  const PORT: number = parseInt(process.env.PORT || "5001", 10);
  const DB_URL: string = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017";
  const TOKENS_DB_URL: string =
    process.env.RT_TOKENS_MONGODB_URI || "mongodb://0.0.0.0:27020";

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
