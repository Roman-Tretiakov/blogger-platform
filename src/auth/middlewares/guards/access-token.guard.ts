import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { IdType } from "../../../core/types/id-type";

export const accessTokenGuard = (
  req: Request<{}, any, any, any>,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"] as string;
  if (!authHeader) return res.sendStatus(HttpStatus.Unauthorized);

  const [authType, token] = authHeader.split(" ");
  if (authType.trim().toLowerCase() !== "bearer") return res.sendStatus(HttpStatus.Unauthorized);

  const userId = jwtService.verifyToken(token);
  if (userId) {
    req.userId = userId as IdType; // Сохраняем данные пользователя в объекте запроса
    next();
  }

  res.sendStatus(HttpStatus.Unauthorized)
};
