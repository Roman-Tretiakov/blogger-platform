import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { authBodyValidationMiddleware } from "../middlewares/auth-body-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { loginHandler } from "./handlers/login.handler";
import { accessTokenGuard } from "../middlewares/guards/access-token.guard";
import { getLoggedUserHandler } from "./handlers/get-me.handler";

export const authRouter = Router();

authRouter.post(
  EndpointList.LOGIN_PATH,
  authBodyValidationMiddleware,
  inputValidationResultMiddleware,
  loginHandler,
);

authRouter.get(
  EndpointList.ME_PATH,
  accessTokenGuard,
  getLoggedUserHandler,
);
