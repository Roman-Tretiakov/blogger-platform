import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { accessTokenGuard } from "../../auth/middlewares/guards/access-token.guard";
import { createCommentsBodyValidationMiddleware } from "../../posts/middlewares/create-comments-body-validation.middleware";
import { getCommentByIdHandler } from "./handlers/get-comment.handler";
import { deleteCommentByIdHandler } from "./handlers/delete-comment.handler";
import { updateCommentByIdHandler } from "./handlers/update-comment.handler";

export const commentsRouter = Router({});

commentsRouter
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getCommentByIdHandler,
  )
  .delete(
    EndpointList.BY_ID,
    accessTokenGuard,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deleteCommentByIdHandler,
  )
  .put(
    EndpointList.BY_ID,
    accessTokenGuard,
    paramIdValidationMiddleware,
    createCommentsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    updateCommentByIdHandler
  );