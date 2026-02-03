import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";
import { isStringUrl } from "../../core/utils/string-transforms";

export const createBlogsBodyValidationMiddleware = [
  body()
    .exists()
    .withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("name")
    .exists()
    .withMessage(ErrorNames.NAME_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.NAME_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.NAME_MISSING_ERROR)
    .isLength({ min: 1, max: 15 })
    .withMessage(ErrorNames.NAME_LENGTH_ERROR),

  body("description")
    .exists()
    .withMessage(ErrorNames.DESCRIPTION_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.DESCRIPTION_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.DESCRIPTION_MISSING_ERROR)
    .isLength({ max: 500 })
    .withMessage(ErrorNames.DESCRIPTION_LENGTH_ERROR),

  body("websiteUrl")
    .exists()
    .withMessage(ErrorNames.WEBSITEURL_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.WEBSITEURL_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.WEBSITEURL_MISSING_ERROR)
    .isLength({ max: 100 })
    .withMessage(ErrorNames.WEBSITEURL_LENGTH_ERROR)
    .custom((str: any) => {
      return isStringUrl(str);
    })
    .withMessage(ErrorNames.WEBSITEURL_FORMAT_ERROR),
];
