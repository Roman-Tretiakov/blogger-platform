import { Request, Response } from "express";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { CookieNames } from "../../../core/constants/cookie-names";
import { tokensQueryRepository } from "../../../refreshTokens/repositories/tokens.query-repository";
import { HttpStatus } from "../../../core/enums/http-status";
import { appConfig } from "../../../core/config/appConfig";

export async function updateTokensHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const refreshToken: string = req.cookies.refreshToken;

  const result = await tokensQueryRepository.isTokenWhitelisted(
    refreshToken,
    userId,
  );
  if (result.status !== ResultStatus.Success) {
    res.status(HttpStatus.Unauthorized).send();
    return;
  } else if (
    await tokensQueryRepository.isWhiteListTokenExpires(result.data!)
  ) {
    await authService.deleteTokenFromWhiteList(result.data!);
    res.status(HttpStatus.Unauthorized).send();
    return;
  }

  const newPairTokens = await authService.rotateTokensPair(
    result.data!,
    userId,
  );
  if (newPairTokens.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(newPairTokens.status))
      .send(newPairTokens.extensions);
    return;
  }

  res
    .status(resultStatusToHttpStatusMapper(newPairTokens.status))
    .cookie(CookieNames.REFRESH_TOKEN, newPairTokens.data!.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: (appConfig.RT_TOKEN_TIME + 10) * 1000, // сек.
    })
    .send({ accessToken: newPairTokens.data!.accessToken });
}
