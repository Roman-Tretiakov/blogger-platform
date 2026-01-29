import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { authBodyValidationMiddleware } from "../middlewares/auth-body-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { authHandler } from "./handlers/auth.handler";

export const authRouter = Router();

authRouter.post(
  EndpointList.AUTH_PATH,
  authBodyValidationMiddleware,
  inputValidationResultMiddleware,
  authHandler,
);
