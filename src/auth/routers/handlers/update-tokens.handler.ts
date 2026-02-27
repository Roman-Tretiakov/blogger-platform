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
  const tokenId = req.userData!.tokenId!;

  const newPairTokens = await authService.rotateTokensPair(tokenId, userId);
  if (newPairTokens.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(newPairTokens.status))
      .send(newPairTokens.extensions);
    return;
  }

  res
    .status(HttpStatus.Ok)
    .cookie(CookieNames.REFRESH_TOKEN, newPairTokens.data!.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: appConfig.RT_TOKEN_TIME + 10000, // сек.
    })
    .send({ accessToken: newPairTokens.data!.accessToken });
}
