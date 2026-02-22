import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";
import { IdType } from "../../../core/types/id-type";

export const refreshTokenGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken: string | undefined = req.cookies["refreshToken"];
    if (!refreshToken) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Refresh token is missing");
    }

    const verifiedUserId: any = jwtService.verifyToken(
      refreshToken,
      TokensTypes.RT,
    );
    if (!verifiedUserId) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Refresh token is invalid or expired");
    }

    req.userData = verifiedUserId as IdType; // Сохраняем данные пользователя в объекте запроса
    next();
  } catch (error: unknown) {
    return res.status(HttpStatus.InternalServerError).send(`message: ${error}`);
  }
};
