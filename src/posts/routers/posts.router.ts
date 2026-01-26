import { Router } from "express";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";
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
import { PostSortField } from "./inputTypes/post-sort-field";

export const postsRouter = Router({});

postsRouter
  // videos crud routes:
  .get(
    EndpointList.EMPTY_PATH,
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getPostListHandler)
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    createPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .put(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    updatePostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .delete(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deletePostHandler,
  ); // сюда добавляем мидлвэры на валидацию перед обработчиками
