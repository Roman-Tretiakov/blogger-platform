import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";

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

    const verifiedToken: any = jwtService.verifyToken(
      refreshToken,
      TokensTypes.RT,
    );
    if (!verifiedToken) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Refresh token is invalid or expired");
    }
    next();
  } catch (error: unknown) {
    return res.status(HttpStatus.InternalServerError).send(`message: ${error}`);
  }
};
