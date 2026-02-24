import { Request, Response } from "express";
import { tokensQueryRepository } from "../../../refreshTokens/repositories/tokens.query-repository";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { HttpStatus } from "../../../core/enums/http-status";
import { authService } from "../../BLL/auth.service";

export async function logoutHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const refreshToken: string = req.cookies.refreshToken;

  const tokenId = await tokensQueryRepository.isTokenWhitelistedAndValid(
    refreshToken,
    userId,
  );
  if (tokenId.status !== ResultStatus.Success) {
    res.status(HttpStatus.Unauthorized).send();
    return;
  }

  const deleteTokenResult = await authService.deleteTokenFromWhiteList(
    <string>tokenId.data,
  );
  if (deleteTokenResult.status !== ResultStatus.Success) {
    res
      .status(HttpStatus.InternalServerError)
      .send(deleteTokenResult.errorMessage);
  }

  res.status(HttpStatus.NoContent).clearCookie("refreshToken").send();
}
