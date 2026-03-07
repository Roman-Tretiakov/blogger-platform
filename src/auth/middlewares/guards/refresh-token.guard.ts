import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { jwtService } from "../../adapters/jwt.service";
import { TokensTypes } from "../../adapters/enums/tokens-types";
import { authDevicesQueryRepository } from "../../../securityDevices/repositories/authDevices.query-repository";
import { authDevicesRepository } from "../../../securityDevices/repositories/authDevices.repository";

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

    const payload = jwtService.verifyToken(refreshToken, TokensTypes.RT);
    if (!payload || !payload.deviceId) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Refresh token is invalid or expired");
    }

    const session = await authDevicesQueryRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!session) {
      return res
        .status(HttpStatus.Unauthorized)
        .send("Session not found for the provided device id");
    }
    if (session.expireAt < new Date()) {
      await authDevicesRepository.deleteByDeviceId(payload.deviceId);
      return res.status(HttpStatus.Unauthorized).send("Session has expired");
    }

    req.userData = {
      // Сохраняем данные пользователя в объекте запроса
      userId: payload.userId,
      deviceId: payload.deviceId,
    };

    next();
  } catch (error: unknown) {
    return res.status(HttpStatus.InternalServerError).send(`message: ${error}`);
  }
};
