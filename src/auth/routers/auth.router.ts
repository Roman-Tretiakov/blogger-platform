import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { authBodyValidationMiddleware } from "../middlewares/auth-body-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { loginHandler } from "./handlers/login.handler";
import { accessTokenGuard } from "../middlewares/guards/access-token.guard";
import { getLoggedUserHandler } from "./handlers/get-me.handler";
import { registrationHandler } from "./handlers/registration.handler";
import { registrationConfirmationHandler } from "./handlers/registration-confirmation.handler";
import { registrationEmailResending } from "./handlers/registration-email-resending";
import { createUsersBodyValidation } from "../../users/middlewares/create-users-body-validation.middleware";

export const authRouter = Router();

authRouter.post(
  EndpointList.REGISTRATION_PATH,
  createUsersBodyValidation,
  inputValidationResultMiddleware,
  registrationHandler,
);

authRouter.post(
  EndpointList.REGISTRATION_CONFIRMATION_PATH,
  createUsersBodyValidation,
  inputValidationResultMiddleware,
  registrationConfirmationHandler,
);

authRouter.post(
  EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
  authBodyValidationMiddleware,
  inputValidationResultMiddleware,
  registrationEmailResending,
);

authRouter.post(
  EndpointList.LOGIN_PATH,
  authBodyValidationMiddleware,
  inputValidationResultMiddleware,
  loginHandler,
);

authRouter.get(EndpointList.ME_PATH, accessTokenGuard, getLoggedUserHandler);
