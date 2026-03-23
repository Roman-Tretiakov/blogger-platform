import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";
import { LikeInputModel } from "../routers/inputTypes/like-input-model";
import { LikesStatus } from "../enums/like-status";

export const reactionCommentsBodyValidationMiddleware = [
  body().exists().withMessage(ErrorNames.BODY_MISSING_ERROR),

  body("likeStatus" as keyof LikeInputModel)
    .exists()
    .withMessage(ErrorNames.CONTENT_MISSING_ERROR)
    .notEmpty({ ignore_whitespace: true })
    .withMessage(ErrorNames.FIELD_EMPTY_ERROR)
    .isString()
    .withMessage(ErrorNames.FIELD_NOT_STRING)
    .custom((value: any) => Object.values(LikesStatus).includes(value))
    .withMessage(
      `Value must be one of: ${Object.values(LikesStatus).join(", ")}`,
    ),
];
