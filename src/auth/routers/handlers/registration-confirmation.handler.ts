import { Response } from "express";
import { RequestWithBody } from "../../../core/types/request-types";
import { authService } from "../../BLL/auth.service";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { HttpStatus } from "../../../core/enums/http-status";

export async function registrationConfirmationHandler(
  req: RequestWithBody<{ code: string }>,
  res: Response,
): Promise<void> {
  const code: string = req.body.code;
  const result = await authService.confirmEmail(code);

  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(createErrorMessages(result.extensions));
    return;
  }

  res.status(HttpStatus.NoContent).send();
}
