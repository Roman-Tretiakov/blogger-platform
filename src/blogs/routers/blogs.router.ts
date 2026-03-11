import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createBlogsBodyValidationMiddleware } from "../middlewares/create-blogs-body-validation-middleware";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { superAdminGuard } from "../../auth/middlewares/guards/super-admin.guard";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { BlogSortFields } from "./inputTypes/blog-sort-fields";
import { createPostsBodyValidationMiddleware } from "../../posts/middlewares/create-posts-body-validation-middleware";
import { PostSortFields } from "../../posts/routers/inputTypes/post-sort-fields";
import { iocContainer } from "../../composition-root";
import { BlogsController } from "./blogs.controller";
import { PostsController } from "../../posts/routers/posts.controller";

const blogsController = iocContainer.resolve(BlogsController);
const postsController = iocContainer.resolve(PostsController);
export const blogsRouter = Router({});

blogsRouter
  .get(
    EndpointList.EMPTY_PATH,
    paginationAndSortingValidation(BlogSortFields),
    inputValidationResultMiddleware,
    blogsController.getList.bind(blogsController),
  )
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.get.bind(blogsController),
  )
  .get(
    EndpointList.POSTS_BY_BLOG_ID,
    paramIdValidationMiddleware,
    paginationAndSortingValidation(PostSortFields),
    inputValidationResultMiddleware,
    postsController.getListByBlog.bind(postsController),
  )
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuard,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.create.bind(blogsController),
  )
  .post(
    EndpointList.POSTS_BY_BLOG_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    createPostsBodyValidationMiddleware(false),
    inputValidationResultMiddleware,
    postsController.createPostByBlog.bind(postsController),
  )
  .put(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    createBlogsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.update.bind(blogsController),
  )
  .delete(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.delete.bind(blogsController),
  );

// Что такое middleware?
//     Middleware (или промежуточные обработчики) — это функции, которые выполняются между получением запроса сервером и отправкой ответа клиенту. Они могут:
//
//     Изменять объект запроса (req) и ответа (res).
//     Прерывать выполнение запроса и отправлять ответ (res.send()).
//     Передавать управление следующему обработчику с помощью next().
