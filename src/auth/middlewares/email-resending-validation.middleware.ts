import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";
import { isEmailString } from "../../core/utils/string-transforms";

export const emailResendingValidationMiddleware = [
  body().exists().withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("email")
    .exists()
    .withMessage(ErrorNames.LOGIN_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING)
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.LOGIN_EMPTY_ERROR)
    .custom((str: any) => {
      return isEmailString(str);
    })
    .withMessage(ErrorNames.EMAIL_FORMAT_ERROR),
];
