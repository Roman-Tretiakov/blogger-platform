import { body } from "express-validator";
import { ErrorNames } from "../../core/enums/error-names";

export const createPostsBodyValidationMiddleware= (requireBlogId: boolean = true) => {
  const postBodyValidations: any[] = [
    body().notEmpty().withMessage(ErrorNames.BODY_MISSING_ERROR),

    body("title")
      .exists()
      .withMessage(ErrorNames.TITLE_MISSING_ERROR)
      .isString()
      .withMessage(ErrorNames.TITLE_TYPE_ERROR)
      .notEmpty({ ignore_whitespace: true })
      .withMessage(ErrorNames.TITLE_MISSING_ERROR)
      .isLength({ min: 1, max: 30 })
      .withMessage(ErrorNames.TITLE_LENGTH_ERROR),

    body("shortDescription")
      .exists()
      .withMessage(ErrorNames.DESCRIPTION_MISSING_ERROR)
      .isString()
      .withMessage(ErrorNames.DESCRIPTION_TYPE_ERROR)
      .notEmpty({ ignore_whitespace: true })
      .withMessage(ErrorNames.DESCRIPTION_MISSING_ERROR)
      .isLength({ max: 100 })
      .withMessage(ErrorNames.DESCRIPTION_LENGTH_ERROR),

    body("content")
      .exists()
      .withMessage(ErrorNames.CONTENT_MISSING_ERROR)
      .isString()
      .withMessage(ErrorNames.CONTENT_TYPE_ERROR)
      .notEmpty({ ignore_whitespace: true })
      .withMessage(ErrorNames.CONTENT_MISSING_ERROR)
      .isLength({ max: 1000 })
      .withMessage(ErrorNames.CONTENT_LENGTH_ERROR),
  ];

  if (requireBlogId) {
    postBodyValidations.push(
      body("blogId")
        .exists()
        .withMessage(ErrorNames.BLOGID_MISSING_ERROR)
        .isString()
        .withMessage(ErrorNames.BLOGID_TYPE_ERROR)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(ErrorNames.BLOGID_MISSING_ERROR),
    );
  }

  return postBodyValidations;
}
