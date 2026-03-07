import { Response } from "express";
import { RequestWithUserData } from "../../../core/types/request-types";
import { IdType } from "../../../core/types/id-type";
import { authService } from "../../../auth/BLL/auth.service";
import { HttpStatus } from "../../../core/enums/http-status";

export async function deleteAllSessionsExceptCurrentHandler(
  req: RequestWithUserData<IdType>,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const currentDeviceId = req.userData!.deviceId!;

  await authService.deleteAllSessionsExceptCurrent(userId, currentDeviceId);

  res.status(HttpStatus.NoContent).send();
}
