import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";

export const registrationConfirmationBodyValidation = [
  body().exists().withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("code")
    .exists()
    .withMessage("Code is required")
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING),
];
