import {param} from "express-validator";
import {ErrorNames} from "../enums/error-names";

export const paramIdValidationMiddleware = param('id')
    .exists()
    .withMessage(ErrorNames.ID_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.ID_TYPE_ERROR)
  .isMongoId()
.withMessage(ErrorNames.ID_FORMAT_ERROR);
