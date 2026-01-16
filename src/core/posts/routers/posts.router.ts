import { Router } from "express";
import { superAdminGuardMiddleware } from "../../../auth/middlewares/super-admin.guard-middleware";
import { EndpointList } from "../../constants/endpoint-list";
import { paramIdValidationMiddleware } from "../../middlewares/params-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../middlewares/input-validation-result.middleware";
import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { postPostHandler } from "./handlers/post-post.handler";
import { putPostHandler } from "./handlers/put-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";
import { createPostsBodyValidationMiddleware } from "../middlewares/create-posts-body-validation-middleware";

export const postsRouter = Router({});

postsRouter
  // videos crud routes:
  .get(EndpointList.EMPTY_PATH, getPostListHandler)
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createPostsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    postPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .put(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createPostsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    putPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .delete(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deletePostHandler,
  ); // сюда добавляем мидлвэры на валидацию перед обработчиками
