import {body} from 'express-validator';
import {ErrorNames} from "../../enums/error-names";

export const updateBlogsBodyValidationMiddleware = [
    body('canBeDownloaded')
        .exists().withMessage(ErrorNames.CAN_BE_DOWNLOADED_MISSING_ERROR)
        .isBoolean().withMessage(ErrorNames.CAN_BE_DOWNLOADED_TYPE_ERROR),

    body('minAgeRestriction')
        .exists().withMessage(ErrorNames.MIN_AGE_RESTRICTION_MISSING_ERROR)
        .isNumeric().withMessage(ErrorNames.MIN_AGE_RESTRICTION_TYPE_ERROR)
        .custom((value: number) => value === null || (value >= 1 && value <= 18))
        .withMessage(ErrorNames.MIN_AGE_RESTRICTION_RANGE_ERROR),

    body('publicationDate')
        .exists().withMessage(ErrorNames.PUBLICATION_DATE_MISSING_ERROR)
        .isString().withMessage(ErrorNames.PUBLICATION_DATE_TYPE_ERROR)
        .isISO8601().withMessage(ErrorNames.PUBLICATION_DATE_FORMAT_ERROR)
];