import { Router } from "express";
import { superAdminGuardMiddleware } from "../../../auth/middlewares/super-admin.guard-middleware";
import { EndpointList } from "../../constants/endpoint-list";
import { paramIdValidationMiddleware } from "../../middlewares/params-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../middlewares/input-validation-result.middleware";
import { createBlogsBodyValidationMiddleware } from "../../blogs/middlewares/create-blogs-body-validation-middleware";
import { updateBlogsBodyValidationMiddleware } from "../../blogs/middlewares/update-blogs-body-validation-middleware";
import { getPostListHandler } from "./handlers/get-post-list.handler";
import { getPostHandler } from "./handlers/get-post.handler";
import { postPostHandler } from "./handlers/post-post.handler";
import { putPostHandler } from "./handlers/put-post.handler";
import { deletePostHandler } from "./handlers/delete-post.handler";

export const postsRouter = Router({});

postsRouter
  // videos crud routes:
  .get(EndpointList.EMPTY_PATH, getPostListHandler)
  .get(
    EndpointList.SINGLE_POST,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    postPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .put(
    EndpointList.SINGLE_POST,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createBlogsBodyValidationMiddleware,
    updateBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    putPostHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .delete(
    EndpointList.SINGLE_POST,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deletePostHandler,
  ); // сюда добавляем мидлвэры на валидацию перед обработчиками
