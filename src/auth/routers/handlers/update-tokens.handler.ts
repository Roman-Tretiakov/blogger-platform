import { Response } from "express";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { CookieNames } from "../../../core/constants/cookie-names";
import { HttpStatus } from "../../../core/enums/http-status";
import { appConfig } from "../../../core/config/appConfig";
import { RequestWithUserData } from "../../../core/types/request-types";
import { IdType } from "../../../core/types/id-type";

export async function updateTokensHandler(
  req: RequestWithUserData<IdType>,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const deviceId = req.userData!.deviceId!;

  const result = await authService.rotateTokensPair(deviceId, userId);
  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(result.extensions);
    return;
  }

  res
    .status(HttpStatus.Ok)
    .cookie(CookieNames.REFRESH_TOKEN, result.data!.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: appConfig.RT_TOKEN_TIME + 10000,
    })
    .send({ accessToken: result.data!.accessToken });
}
