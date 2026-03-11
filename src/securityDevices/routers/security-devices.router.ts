import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { refreshTokenGuard } from "../../auth/middlewares/guards/refresh-token.guard";
import { iocContainer } from "../../composition-root";
import { SecurityDevicesController } from "./security-devices.controller";

const securityDevicesController = iocContainer.resolve(
  SecurityDevicesController,
);
export const securityDevicesRouter = Router({});

securityDevicesRouter
  .get(
    EndpointList.EMPTY_PATH,
    refreshTokenGuard,
    securityDevicesController.getSessionList.bind(securityDevicesController),
  )
  .delete(
    EndpointList.EMPTY_PATH,
    refreshTokenGuard,
    securityDevicesController.deleteAllSessionsExceptCurrent.bind(
      securityDevicesController,
    ),
  )
  .delete(
    EndpointList.SECURITY_DEVICE_BY_ID,
    refreshTokenGuard,
    securityDevicesController.deleteSession.bind(securityDevicesController),
  );
