import { Router } from "express";
import { superAdminGuard } from "../../auth/middlewares/guards/super-admin.guard";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { createPostHandler } from "./handlers/create-post.handler";
import { updatePostHandler } from "./handlers/update-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";
import { createPostsBodyValidationMiddleware } from "../middlewares/create-posts-body-validation-middleware";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { PostSortFields } from "./inputTypes/post-sort-fields";
import { accessTokenGuard } from "../../auth/middlewares/guards/access-token.guard";
import { createCommentByPostHandler } from "./handlers/create-comment-by-post.handler";

export const postsRouter = Router({});

postsRouter
  .post(
    EndpointList.COMMENTS_BY_POST_ID,
    accessTokenGuard,
    paramIdValidationMiddleware,
    createCommentByPostHandler,
    inputValidationResultMiddleware,
    createCommentByPostHandler,
  )
  .get(
    EndpointList.COMMENTS_BY_POST_ID,
  )
  .get(
    EndpointList.EMPTY_PATH,
    paginationAndSortingValidation(PostSortFields),
    inputValidationResultMiddleware,
    getPostListHandler,
  )
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuard,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    createPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuard,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    createPostHandler,
  )
  .put(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    updatePostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .delete(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deletePostHandler,
  ); // сюда добавляем мидлвэры на валидацию перед обработчиками
