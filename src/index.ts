import express from "express";
import dotenv from "dotenv";
import { setupApp } from "./setup-app";
import { runDB } from "./db/mongo.db";

const bootstrap = async () => {
  dotenv.config();

  // создание приложения
  const app = express();
  setupApp(app);

  // порт приложения
  const PORT: number = parseInt(process.env.PORT || "5001", 10);
  const DB_URL: string = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017";

  await runDB(DB_URL);
  //await initDB();

  // запуск приложения
  const server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });

  server.keepAliveTimeout = 300000;
  server.headersTimeout = 301000;
  server.timeout = 300000;
};

bootstrap().catch(console.error);
