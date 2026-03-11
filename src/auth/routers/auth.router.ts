import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { authBodyValidationMiddleware } from "../middlewares/auth-body-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { accessTokenGuard } from "../middlewares/guards/access-token.guard";
import { createUsersBodyValidation } from "../../users/middlewares/create-users-body-validation.middleware";
import { registrationConfirmationBodyValidation } from "../middlewares/registration-confirmation-body.validation";
import { emailResendingValidationMiddleware } from "../middlewares/email-resending-validation.middleware";
import { refreshTokenGuard } from "../middlewares/guards/refresh-token.guard";
import { rateLimitsMiddleware } from "../../core/middlewares/rateLimiter/rate-limits.middleware";
import { iocContainer } from "../../composition-root";
import { AuthController } from "./auth.controller";

const authController = iocContainer.resolve(AuthController);
export const authRouter = Router();

authRouter.post(
  EndpointList.REGISTRATION_PATH,
  rateLimitsMiddleware,
  createUsersBodyValidation,
  inputValidationResultMiddleware,
  authController.registration.bind(authController),
);

authRouter.post(
  EndpointList.REGISTRATION_CONFIRMATION_PATH,
  rateLimitsMiddleware,
  registrationConfirmationBodyValidation,
  inputValidationResultMiddleware,
  authController.registrationConfirmation.bind(authController),
);

authRouter.post(
  EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
  rateLimitsMiddleware,
  emailResendingValidationMiddleware,
  inputValidationResultMiddleware,
  authController.registrationEmailResending.bind(authController),
);

authRouter.post(
  EndpointList.LOGIN_PATH,
  rateLimitsMiddleware,
  authBodyValidationMiddleware,
  inputValidationResultMiddleware,
  authController.login.bind(authController),
);

authRouter.post(
  EndpointList.REFRESH_TOKEN_PATH,
  refreshTokenGuard,
  authController.updateTokens.bind(authController),
);

authRouter.post(
  EndpointList.LOGOUT_PATH,
  refreshTokenGuard,
  authController.logout.bind(authController),
);

authRouter.get(
  EndpointList.ME_PATH,
  accessTokenGuard,
  authController.getLoggedUser.bind(authController),
);
