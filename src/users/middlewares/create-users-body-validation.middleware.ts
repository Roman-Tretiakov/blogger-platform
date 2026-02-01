import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";
import {
  isEmailString,
  isLoginString,
} from "../../core/utils/string_transforms";

export const createUsersBodyValidation = [
  body()
    .exists()
    .withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("login")
    .exists()
    .withMessage(ErrorNames.LOGIN_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.LOGIN_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.LOGIN_EMPTY_ERROR)
    .isLength({ min: 3, max: 10 })
    .withMessage(ErrorNames.LOGIN_LENGTH_ERROR)
    .custom((str: any) => {
      return isLoginString(str);
    })
    .withMessage(ErrorNames.LOGIN_FORMAT_ERROR),

  body("password")
    .exists()
    .withMessage(ErrorNames.PASSWORD_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.PASSWORD_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.PASSWORD_EMPTY_ERROR)
    .isLength({ min: 6, max: 20 })
    .withMessage(ErrorNames.PASSWORD_LENGTH_ERROR),

  body("email")
    .exists()
    .withMessage(ErrorNames.EMAIL_MISSING_ERROR)
    .isString()
    .withMessage(ErrorNames.EMAIL_TYPE_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.EMAIL_EMPTY_ERROR)
    .custom((str: any) => {
      return isEmailString(str);
    })
    .withMessage(ErrorNames.EMAIL_FORMAT_ERROR)
];
