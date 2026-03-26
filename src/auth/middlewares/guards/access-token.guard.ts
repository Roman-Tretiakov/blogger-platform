import { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { JwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";
import { iocContainer } from "../../../composition-root";

export const accessTokenGuard: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const jwtService = iocContainer.resolve(JwtService);
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

  const verifiedData = jwtService.verifyToken(token, TokensTypes.AT);
  if (!verifiedData) {
    return res.sendStatus(HttpStatus.Unauthorized);
  }

  req.userData = { userId: verifiedData.userId }; // Сохраняем данные пользователя в объекте запроса
  next();
};
