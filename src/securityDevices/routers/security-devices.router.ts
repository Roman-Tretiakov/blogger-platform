import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { refreshTokenGuard } from "../../auth/middlewares/guards/refresh-token.guard";
import { getSessionListHandler } from "./handlers/get-session-list.handler";
import { deleteAllSessionsExceptCurrentHandler } from "./handlers/delete-all-session.handler";
import { deleteSessionByIdHandler } from "./handlers/delete-session-by-id.handler";

export const securityDevicesRouter = Router({});

securityDevicesRouter.get(
  EndpointList.EMPTY_PATH,
  refreshTokenGuard,
  getSessionListHandler,
);

securityDevicesRouter.delete(
  EndpointList.EMPTY_PATH,
  refreshTokenGuard,
  deleteAllSessionsExceptCurrentHandler,
);

securityDevicesRouter.delete(
  EndpointList.SECURITY_DEVICE_BY_ID,
  refreshTokenGuard,
  deleteSessionByIdHandler,
);
