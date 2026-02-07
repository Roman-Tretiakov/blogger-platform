import jwt, { JwtPayload } from "jsonwebtoken";
import { appConfig } from "../../core/config/appConfig";

const JWT_SECRET: string = appConfig.JWT_SECRET;
const JWT_EXPIRES_IN: any = appConfig.AT_TOKEN_TIME;

export const jwtService = {
  createToken(userId: string): string {
    const payload = {
      userId: userId
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  decodeToken(userId: string): string | JwtPayload | null {
    try {
      return jwt.decode(userId);
    } catch (err) {
      console.error("Token decode some error: ", err);
      return null; // Невалидный токен
    }
  },

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        console.warn("Token expired at: ", err.expiredAt);
      }
      else if (err instanceof jwt.JsonWebTokenError) {
        console.warn("Invalid token: ", err.message);
      }
      return null; // Невалидный токен
    }
  },
}