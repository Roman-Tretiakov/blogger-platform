import { Request, Response } from "express";
import { AuthDevicesQueryRepository } from "../repositories/authDevices.query-repository";
import { RequestWithUserData } from "../../core/types/request-types";
import { IdType } from "../../core/types/id-type";
import { HttpStatus } from "../../core/enums/http-status";
import { AuthService } from "../../auth/BLL/auth.service";
import { resultStatusToHttpStatusMapper } from "../../core/utils/result-code-to-http-status.mapper";
import { ResultStatus } from "../../core/enums/result-statuses";
import { inject, injectable } from "inversify";

@injectable()
export class SecurityDevicesController {
  constructor(
    @inject(AuthDevicesQueryRepository)
    private authDevicesQueryRepository: AuthDevicesQueryRepository,
    @inject(AuthService)
    private authService: AuthService,
  ) {}

  async getSessionList(
    req: RequestWithUserData<IdType>,
    res: Response,
  ): Promise<void> {
    const userId = req.userData!.userId;
    const sessions =
      await this.authDevicesQueryRepository.findAllByUserId(userId);

    const result = sessions.map((s) => ({
      ip: s.deviceInfo.ip ?? "unknown",
      title: s.deviceInfo.title,
      lastActiveDate: s.lastActiveDate,
      deviceId: s.deviceInfo.deviceId,
    }));

    res.status(HttpStatus.Ok).send(result);
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    const userId = req.userData!.userId;
    const targetDeviceId = req.params.deviceId;

    const session =
      await this.authService.findSessionByDeviceId(targetDeviceId);
    if (session.status !== ResultStatus.Success) {
      res.status(resultStatusToHttpStatusMapper(session.status)).send();
      return;
    }

    if (session.data!.userId !== userId) {
      res.status(HttpStatus.Forbidden).send();
      return;
    }

    const deletedSession = await this.authService.deleteSession(targetDeviceId);
    if (deletedSession.status !== ResultStatus.Success) {
      res.status(HttpStatus.InternalServerError).send();
      return;
    }

    res
      .status(HttpStatus.NoContent)
      .send(`Session deleted successfully by device id: ${targetDeviceId}`);
  }

  async deleteAllSessionsExceptCurrent(
    req: RequestWithUserData<IdType>,
    res: Response,
  ): Promise<void> {
    const userId = req.userData!.userId;
    const currentDeviceId = req.userData!.deviceId!;

    await this.authService.deleteAllSessionsExceptCurrent(
      userId,
      currentDeviceId,
    );

    res.status(HttpStatus.NoContent).send();
  }
}
