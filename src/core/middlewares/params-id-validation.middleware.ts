import {param} from "express-validator";
import {ErrorNames} from "../enums/error-names";

export const paramIdValidationMiddleware = param('id')
    .exists()
    .withMessage(ErrorNames.ID_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.ID_TYPE_ERROR)
    .isLength({min: 1})
    .withMessage(ErrorNames.ID_EMPTY_ERROR)
    .isNumeric()
    .withMessage(ErrorNames.ID_FORMAT_ERROR);
