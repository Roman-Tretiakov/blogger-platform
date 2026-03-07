import { Request, Response } from "express";
import { authService } from "../../../auth/BLL/auth.service";
import { HttpStatus } from "../../../core/enums/http-status";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";

export async function deleteSessionByIdHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const targetDeviceId = req.params.deviceId;

  const session = await authService.findSessionByDeviceId(targetDeviceId);
  if (session.status !== ResultStatus.Success) {
    res.status(resultStatusToHttpStatusMapper(session.status)).send();
    return;
  }

  if (session.data!.userId !== userId) {
    res.status(HttpStatus.Forbidden).send();
    return;
  }

  const deletedSession = await authService.deleteSession(targetDeviceId);
  if (deletedSession.status !== ResultStatus.Success) {
    res.status(HttpStatus.InternalServerError).send();
    return;
  }

  res
    .status(HttpStatus.NoContent)
    .send(`Session deleted successfully by device id: ${targetDeviceId}`);
}
