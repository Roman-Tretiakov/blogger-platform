import express from "express";
import { setupApp } from "./setup-app";

// создание приложения
export const app = express();
setupApp(app);

// порт приложения
const PORT: string | number = process.env.PORT || 5001;

// запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
