import { Request, Response } from "express";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { CookieNames } from "../../../core/constants/cookie-names";
import { tokensQueryRepository } from "../../../refreshTokens/repositories/tokens.query-repository";

export async function updateTokensHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const refreshToken: string = req.cookies.refreshToken;

  const refreshTokenId = await tokensQueryRepository.isTokenWhitelistedAndValid(
    refreshToken,
    userId,
  );

  if (refreshTokenId.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(refreshTokenId.status))
      .send(refreshTokenId.extensions);
    return;
  }

  const result = await authService.rotateTokensPair(
    refreshToken,
    refreshTokenId.data!,
    userId,
  );

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(result.extensions);
    return;
  }

  res
    .status(resultStatusToHttpStatusMapper(result.status))
    .cookie(CookieNames.REFRESH_TOKEN, result.data!.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 25 * 1000, // 25 сек.
    })
    .send(result.data!.accessToken);
}
