import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";

export const authBodyValidationMiddleware = [
  body()
    .exists()
    .withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("loginOrEmail")
    .exists()
    .withMessage(ErrorNames.LOGIN_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING)
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.LOGIN_EMPTY_ERROR),

  body("password")
    .exists()
    .withMessage(ErrorNames.PASSWORD_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING)
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.PASSWORD_EMPTY_ERROR),
];
