import { param } from "express-validator";
import { ErrorNames } from "../enums/error-names";

export const paramIdValidationMiddleware = param("id")
  .exists()
  .withMessage(ErrorNames.ID_MISSING_ERROR)
  .notEmpty({ ignore_whitespace: true })
  .withMessage(ErrorNames.ID_EMPTY_ERROR)
  .isString()
  .withMessage(ErrorNames.ID_TYPE_ERROR)
  .isMongoId()
  .withMessage(ErrorNames.ID_FORMAT_ERROR);
