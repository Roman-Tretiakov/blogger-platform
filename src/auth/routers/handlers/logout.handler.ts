import { Response } from "express";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { HttpStatus } from "../../../core/enums/http-status";
import { authService } from "../../BLL/auth.service";
import { CookieNames } from "../../../core/constants/cookie-names";
import { RequestWithUserData } from "../../../core/types/request-types";
import { IdType } from "../../../core/types/id-type";

export async function logoutHandler(
  req: RequestWithUserData<IdType>,
  res: Response,
): Promise<void> {
  const tokenId: string = req.userData!.tokenId!;

  const deleteTokenResult = await authService.deleteTokenFromWhiteList(tokenId);
  if (deleteTokenResult.status !== ResultStatus.Success) {
    res
      .status(HttpStatus.InternalServerError)
      .send(deleteTokenResult.errorMessage);
    return;
  }

  res
    .clearCookie(CookieNames.REFRESH_TOKEN)
    .status(HttpStatus.NoContent)
    .send();
}
