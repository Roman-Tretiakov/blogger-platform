import { Router } from "express";
import { superAdminGuard } from "../../auth/middlewares/guards/super-admin.guard";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createPostsBodyValidationMiddleware } from "../middlewares/create-posts-body-validation-middleware";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { PostSortFields } from "./inputTypes/post-sort-fields";
import { accessTokenGuard } from "../../auth/middlewares/guards/access-token.guard";
import { createCommentsBodyValidationMiddleware } from "../middlewares/create-comments-body-validation.middleware";
import { CommentsSortFields } from "../../comments/routers/inputTypes/comments-sort-fields";
import { iocContainer } from "../../composition-root";
import { PostsController } from "./posts.controller";

const postsController = iocContainer.resolve(PostsController);
export const postsRouter = Router({});

postsRouter
  .post(
    EndpointList.COMMENTS_BY_POST_ID,
    accessTokenGuard,
    paramIdValidationMiddleware,
    createCommentsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    postsController.createCommentByPost.bind(postsController),
  )
  .get(
    EndpointList.COMMENTS_BY_POST_ID,
    paramIdValidationMiddleware,
    paginationAndSortingValidation(CommentsSortFields),
    inputValidationResultMiddleware,
    postsController.getCommentsByPostList.bind(postsController),
  )
  .get(
    EndpointList.EMPTY_PATH,
    paginationAndSortingValidation(PostSortFields),
    inputValidationResultMiddleware,
    postsController.getList.bind(postsController),
  )
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    postsController.get.bind(postsController),
  )
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuard,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    postsController.createPost.bind(postsController),
  )
  .put(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    createPostsBodyValidationMiddleware(),
    inputValidationResultMiddleware,
    postsController.update.bind(postsController),
  )
  .delete(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    postsController.delete.bind(postsController),
  );
