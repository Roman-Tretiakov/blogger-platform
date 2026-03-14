import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";

export const newPasswordBodyValidation = [
  body().exists().withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("newPassword")
    .exists()
    .withMessage(ErrorNames.PASSWORD_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING)
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.PASSWORD_EMPTY_ERROR)
    .isLength({ min: 6, max: 20 })
    .withMessage(ErrorNames.PASSWORD_LENGTH_ERROR),

  body("recoveryCode")
    .exists()
    .withMessage("Code is required")
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING)
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Code cannot be empty"),
];
