import { Response } from "express";
import { RequestWithUserData } from "../../../core/types/request-types";
import { IdType } from "../../../core/types/id-type";
import { authDevicesQueryRepository } from "../../repositories/authDevices.query-repository";
import { HttpStatus } from "../../../core/enums/http-status";

export async function getSessionListHandler(
  req: RequestWithUserData<IdType>,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;
  const sessions = await authDevicesQueryRepository.findAllByUserId(userId);

  const result = sessions.map((s) => ({
    ip: s.deviceInfo.ip ?? "unknown",
    title: s.deviceInfo.title,
    lastActiveDate: s.lastActiveDate,
    deviceId: s.deviceInfo.deviceId,
  }));

  res.status(HttpStatus.Ok).send(result);
}
