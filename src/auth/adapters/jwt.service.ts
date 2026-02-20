import jwt, { JwtPayload } from "jsonwebtoken";
import { appConfig } from "../../core/config/appConfig";
import { TokensTypes } from "./enums/tokens-types";

const JWT_AT_SECRET: string = appConfig.AT_TOKEN_SECRET;
const JWT_RT_SECRET: string = appConfig.RT_TOKEN_SECRET;
const JWT_AT_EXPIRES_IN: number = appConfig.AT_TOKEN_TIME;
const JWT_RT_EXPIRES_IN: number = appConfig.RT_TOKEN_TIME;

export const jwtService = {
  createToken(userId: string, type: TokensTypes): string {
    const payload = {
      userId: userId,
    };
    switch (type) {
      case TokensTypes.AT:
        return jwt.sign(payload, JWT_AT_SECRET, {
          expiresIn: JWT_AT_EXPIRES_IN * 1000, // Умножаем на 1000, так как jwt ожидает время в секундах, а у нас в конфиге время в миллисекундах
        });
      case TokensTypes.RT:
        return jwt.sign(payload, JWT_RT_SECRET, {
          expiresIn: JWT_RT_EXPIRES_IN * 1000, // Умножаем на 1000, так как jwt ожидает время в секундах, а у нас в конфиге время в миллисекундах
        });
    }
  },

  decodeToken(userId: string): string | JwtPayload | null {
    try {
      return jwt.decode(userId);
    } catch (err) {
      console.error("Token decode some error: ", err);
      return null; // Невалидный токен
    }
  },

  verifyToken(token: string, type: TokensTypes): { userId: string } | null {
    try {
      switch (type) {
        case TokensTypes.AT:
          return jwt.verify(token, JWT_AT_SECRET) as { userId: string };
        case TokensTypes.RT:
          return jwt.verify(token, JWT_RT_SECRET) as { userId: string };
      }
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        console.log("Token expired at: ", err.expiredAt);
      } else if (err instanceof jwt.JsonWebTokenError) {
        console.log("Invalid token: ", err.message);
      }
      return null; // Невалидный токен
    }
  },
};
