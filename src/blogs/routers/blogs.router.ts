import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { getBlogListHandler } from "./handlers/get-blog-list.handler";
import { getBlogHandler } from "./handlers/get-blog.handler";
import { postBlogHandler } from "./handlers/post-blog.handler";
import { putBlogHandler } from "./handlers/put-blog.handler";
import { deleteBlogHandler } from "./handlers/delete-blog.handler";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createBlogsBodyValidationMiddleware } from "../middlewares/create-blogs-body-validation-middleware";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";

export const blogsRouter = Router({});

blogsRouter
  .get(EndpointList.EMPTY_PATH, getBlogListHandler)
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    postBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .put(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    putBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .delete(
    EndpointList.BY_ID,
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