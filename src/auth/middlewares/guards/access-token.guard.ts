import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { IdType } from "../../../core/types/id-type";

export const accessTokenGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"] as string;
  if (!authHeader)
    return res
      .status(HttpStatus.Unauthorized)
      .send("Header authorization is required");

  const [authType, token] = authHeader.split(" ");
  if (authType.trim().toLowerCase() !== "bearer") {
    return res
      .status(HttpStatus.Unauthorized)
      .send("Header authorization must be in format 'Bearer ...'");
  }

  const userId = jwtService.verifyToken(token);
  if (!userId) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  req.userData = userId as IdType; // Сохраняем данные пользователя в объекте запроса
  next();
};
