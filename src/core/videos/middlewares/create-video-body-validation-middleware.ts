import {body} from 'express-validator';
import {ErrorNames} from "../../enums/error-names";
import {AvailableResolutions} from "../../enums/available-resolutions";

export const createVideoBodyValidationMiddleware = [
    body().notEmpty().withMessage(ErrorNames.BODY_MISSING_ERROR),

    body('title')
        .exists().withMessage(ErrorNames.TITLE_MISSING_ERROR)
        .isString().withMessage(ErrorNames.TITLE_TYPE_ERROR)
        .isLength({min: 2, max: 40}).withMessage(ErrorNames.TITLE_LENGTH_ERROR),

    body('author')
        .exists().withMessage(ErrorNames.AUTHOR_MISSING_ERROR)
        .isString().withMessage(ErrorNames.AUTHOR_TYPE_ERROR)
        .isLength({max: 1}).withMessage(ErrorNames.AUTHOR_LENGTH_ERROR),

    body('availableResolutions')
        .exists().withMessage(ErrorNames.AVAILABLE_RESOLUTIONS_MISSING_ERROR)
        .isArray().withMessage(ErrorNames.AVAILABLE_RESOLUTIONS_TYPE_ERROR)
        .isLength({
            min: 1,
            max: Object.values(AvailableResolutions).length
        }).withMessage(ErrorNames.AVAILABLE_RESOLUTIONS_LENGTH_ERROR)
        .custom((resolutions: string[]) => {
            resolutions.every(resolution =>
                Object.values(AvailableResolutions).includes(resolution as AvailableResolutions));
        }).withMessage(ErrorNames.AVAILABLE_RESOLUTIONS_VALUE_ERROR)
];