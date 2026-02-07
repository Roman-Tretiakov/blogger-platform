import { Request, Response } from "express";
import { LoginInputModel } from "../../types/login-Input-model";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";

export async function authHandler(
  req: Request<{}, {}, LoginInputModel>,
  res: Response,
): Promise<void> {
  const loginOrEmail: string = req.body.loginOrEmail;
  const password: string = req.body.password;
  const result = await authService.loginUser(loginOrEmail, password);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(result.extensions);
  }

  res.status(resultStatusToHttpStatusMapper(result.status)).send(result.data);
}
