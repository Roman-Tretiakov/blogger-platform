import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";
import { tokensQueryRepository } from "../../../refreshTokens/repositories/tokens.query-repository";
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

    // Добавляем проверку наличия токена в whitelist
    const token = await tokensQueryRepository.getValidTokenDetails(
      refreshToken,
      verifiedUserId.userId,
    );

    if (!token.data) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Refresh token not found");
    }

    // Проверяем не истек ли токен
    if (token.data.expiresAt < new Date()) {
      await authService.deleteTokenFromWhiteList(token.data.id);
      return res
        .status(HttpStatus.Unauthorized)
        .send(`Refresh token with id expired: ${token.data.expiresAt}`);
    }

    req.userData = {
      // Сохраняем данные пользователя в объекте запроса
      userId: verifiedUserId,
      tokenId: token.data.id,
    };
    next();
  } catch (error: unknown) {
    return res.status(HttpStatus.InternalServerError).send(`message: ${error}`);
  }
};
