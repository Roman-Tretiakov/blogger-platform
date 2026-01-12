import { Router } from "express";
import { EndpointList } from "../../constants/endpoint-list";
import { getBlogListHandler } from "./handlers/get-blog-list.handler";
import { getBlogHandler } from "./handlers/get-blog.handler";
import { postBlogHandler } from "./handlers/post-blog.handler";
import { putBlogHandler } from "./handlers/put-blog.handler";
import { deleteBlogHandler } from "./handlers/delete-blog.handler";
import { inputValidationResultMiddleware } from "../../middlewares/input-validation-result.middleware";
import { createVideoBodyValidationMiddleware } from "../middlewares/create-video-body-validation-middleware";
import { paramIdValidationMiddleware } from "../../middlewares/params-id-validation.middleware";
import { updateVideoBodyValidationMiddleware } from "../middlewares/update-video-body-validation-middleware";
import { superAdminGuardMiddleware } from "../../../auth/middlewares/super-admin.guard-middleware";

export const blogsRouter = Router({});

blogsRouter
  // videos crud routes:
  .get(EndpointList.EMPTY_PATH, getBlogListHandler)
  .get(
    EndpointList.SINGLE_BLOG,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createVideoBodyValidationMiddleware,
    inputValidationResultMiddleware,
    postBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .put(
    EndpointList.SINGLE_BLOG,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createVideoBodyValidationMiddleware,
    updateVideoBodyValidationMiddleware,
    inputValidationResultMiddleware,
    putBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .delete(
    EndpointList.SINGLE_BLOG,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  ); // сюда добавляем мидлвэры на валидацию перед обработчиками

// Что такое middleware?
//     Middleware (или промежуточные обработчики) — это функции, которые выполняются между получением запроса сервером и отправкой ответа клиенту. Они могут:
//
//     Изменять объект запроса (req) и ответа (res).
//     Прерывать выполнение запроса и отправлять ответ (res.send()).
//     Передавать управление следующему обработчику с помощью next().