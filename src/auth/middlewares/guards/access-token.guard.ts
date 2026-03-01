import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";

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

  const userId = jwtService.verifyToken(token, TokensTypes.AT);
  if (!userId) {
    return res.sendStatus(HttpStatus.Unauthorized);
  }

  req.userData = userId; // Сохраняем данные пользователя в объекте запроса
  next();
};
