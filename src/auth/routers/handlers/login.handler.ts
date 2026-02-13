import { Response } from "express";
import { LoginInputModel } from "../../types/login-Input-model";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { RequestWithBody } from "../../../core/types/request-types";

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

  res.status(resultStatusToHttpStatusMapper(result.status)).send(result.data);
}
