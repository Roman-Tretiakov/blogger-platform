import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { refreshTokenGuard } from "../../auth/middlewares/guards/refresh-token.guard";
import { getSessionListHandler } from "./handlers/get-session-list.handler";
import { deleteAllSessionsExceptCurrentHandler } from "./handlers/delete-all-session.handler";

export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
  EndpointList.SECURITY_DEVICES_PATH,
  refreshTokenGuard,
  getSessionListHandler,
);

securityDevicesRouter.delete(
  EndpointList.SECURITY_DEVICES_PATH,
  refreshTokenGuard,
  deleteAllSessionsExceptCurrentHandler,
);

securityDevicesRouter.delete(
  EndpointList.SECURITY_DEVICES_PATH + EndpointList.BY_ID,
  refreshTokenGuard,
  deleteAllSessionsExceptCurrentHandler,
);
