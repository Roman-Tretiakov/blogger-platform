import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";

export const createCommentsBodyValidationMiddleware = [
  body().exists().withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("content")
    .exists()
    .withMessage(ErrorNames.CONTENT_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.CONTENT_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.CONTENT_MISSING_ERROR)
    .isLength({ min: 20, max: 300 })
    .withMessage(ErrorNames.CONTENT_LENGTH_ERROR),
];
