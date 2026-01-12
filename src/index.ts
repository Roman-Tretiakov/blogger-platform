import express from "express";
import dotenv from "dotenv";
import { setupApp } from "./setup-app";

dotenv.config();

// создание приложения
const app = express();
setupApp(app);

// порт приложения
const PORT: number = parseInt(process.env.PORT || "5001", 10);

// запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
