import { Response } from "express";
import { RequestWithBody } from "../../../core/types/request-types";
import { authService } from "../../BLL/auth.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { HttpStatus } from "../../../core/enums/http-status";

export async function registrationEmailResending(
  req: RequestWithBody<{ email: string }>,
  res: Response,
): Promise<void> {
  const { email } = req.body;

  const result = await authService.resendEmail(email);
  if (result.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(createErrorMessages(result.extensions));
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
}
