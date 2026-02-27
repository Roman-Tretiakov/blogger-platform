import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";
import { IdType } from "../../../core/types/id-type";
import { tokensQueryRepository } from "../../../refreshTokens/repositories/tokens.query-repository";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { authService } from "../../BLL/auth.service";

export const refreshTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken: string | undefined = req.cookies.refreshToken;
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

    // ✅ Добавляем проверку наличия токена в whitelist
    const tokenResult = await tokensQueryRepository.isTokenWhitelisted(
      refreshToken,
      verifiedUserId.userId,
    );

    if (tokenResult.status !== ResultStatus.Success) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Refresh token not found in whitelist");
    }

    // Проверяем не истек ли токен
    const isExpired = await tokensQueryRepository.isWhiteListTokenExpires(
      tokenResult.data!,
    );
    if (isExpired) {
      await authService.deleteTokenFromWhiteList(tokenResult.data!);
      return res.status(HttpStatus.Unauthorized).send("Refresh token expired");
    }

    req.userData = verifiedUserId as IdType; // Сохраняем данные пользователя в объекте запроса
    req.tokenId = tokenResult.data as string;
    next();
  } catch (error: unknown) {
    return res.status(HttpStatus.InternalServerError).send(`message: ${error}`);
  }
};
