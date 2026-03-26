import { NextFunction, Request, RequestHandler, Response } from "express";
import { JwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";
import { iocContainer } from "../../../composition-root";

export const accessTokenOptionGuard: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const jwtService = iocContainer.resolve(JwtService);
  const authHeader = req.headers["authorization"] as string;
  if (authHeader) {
    const [authType, token] = authHeader.split(" ");
    if (authType.trim().toLowerCase() === "bearer") {
      const verifiedData = jwtService.verifyToken(token, TokensTypes.AT);
      if (verifiedData) req.userData = { userId: verifiedData.userId }; // Сохраняем данные пользователя в объекте запроса
    }
  }

  next();
};
