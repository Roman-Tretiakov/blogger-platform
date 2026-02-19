import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";

export const refreshTokenGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //TODO: update refresh token validation
  const refreshToken = req.cookies?.refreshToken?.toString();
  if (!refreshToken) {
    return res.status(HttpStatus.Unauthorized).send("Refresh token is missing");
  }

  next();
};
