import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { getBlogListHandler } from "./handlers/get-blog-list.handler";
import { getBlogHandler } from "./handlers/get-blog.handler";
import { createBlogHandler } from "./handlers/create-blog.handler";
import { updateBlogHandler } from "./handlers/update-blog.handler";
import { deleteBlogHandler } from "./handlers/delete-blog.handler";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createBlogsBodyValidationMiddleware } from "../middlewares/create-blogs-body-validation-middleware";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { BlogSortFields } from "./inputTypes/blog-sort-fields";
import { createPostsBodyValidationMiddleware } from "../../posts/middlewares/create-posts-body-validation-middleware";
import { createPostByBlogHandler } from "../../posts/routers/handlers/create-post.handler";
import { PostSortFields } from "../../posts/routers/inputTypes/post-sort-fields";
import { getPostListByBlogHandler } from "../../posts/routers/handlers/get-post-list-by-blog.handler";

export const blogsRouter = Router({});

blogsRouter
  .get(
    EndpointList.EMPTY_PATH,
    paginationAndSortingValidation(BlogSortFields),
    inputValidationResultMiddleware,
    getBlogListHandler,
  )
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    getBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .get(
    EndpointList.POSTS_BY_BLOG_ID,
    paramIdValidationMiddleware,
    paginationAndSortingValidation(PostSortFields),
    inputValidationResultMiddleware,
    getPostListByBlogHandler,
  )
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    createBlogHandler,
  ) // сюда добавляем мидлвэры на валидацию перед обработчиками
  .post(
    EndpointList.POSTS_BY_BLOG_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createPostsBodyValidationMiddleware(false),
    inputValidationResultMiddleware,
    createPostByBlogHandler,
  )
  .put(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    updateBlogHandler,
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