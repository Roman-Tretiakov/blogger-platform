import { Response } from "express";
import { LoginInputModel } from "../../types/login-Input-model";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { RequestWithBody } from "../../../core/types/request-types";
import { CookieNames } from "../../../core/constants/cookie-names";
import { appConfig } from "../../../core/config/appConfig";

export async function loginHandler(
  req: RequestWithBody<LoginInputModel>,
  res: Response,
): Promise<void> {
  const loginOrEmail: string = req.body.loginOrEmail;
  const password: string = req.body.password;
  const result = await authService.loginUser(loginOrEmail, password);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(result.extensions);
    return;
  }

  req.session.userId = result.data!.userId;
  req.session.deviceId = req.sessionID;
  req.session.isAuthenticated = true;
  const sessionId = req.sessionID;

  await authService.createAuthDeviceSession({
    userId: result.data!.userId,
    deviceInfo: {
      deviceId: sessionId,
      title: req.headers["user-agent"] || "unknown",
      ip: req.ip || null,
    },
    issuedAt: new Date(),
    expireAt: new Date(Date.now() + appConfig.RT_TOKEN_TIME),
    lastActiveDate: new Date(),
    isCurrentSession: true,
  });

  res
    .status(resultStatusToHttpStatusMapper(result.status))
    .cookie(CookieNames.REFRESH_TOKEN, result.data!.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: (appConfig.RT_TOKEN_TIME + 10) * 1000, // сек.
    })
    .send({ accessToken: result.data!.accessToken });
}
