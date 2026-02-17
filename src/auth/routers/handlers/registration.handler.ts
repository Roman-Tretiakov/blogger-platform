import { Response } from "express";
import { RequestWithBody } from "../../../core/types/request-types";
import { UserInputModel } from "../../../users/types/inputTypes/user-input-model";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { HttpStatus } from "../../../core/enums/http-status";
import { createErrorMessages } from "../../../core/utils/error.utils";

export async function registrationHandler(
  req: RequestWithBody<UserInputModel>,
  res: Response,
): Promise<void> {
  const { login, password, email } = req.body;
  const result = await authService.registerUser(login, email, password);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(createErrorMessages(result.extensions));
    return;
  }

  res.status(HttpStatus.NoContent).send();
}
