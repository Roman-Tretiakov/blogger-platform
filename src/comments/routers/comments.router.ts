import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { accessTokenGuard } from "../../auth/middlewares/guards/access-token.guard";
import { createCommentsBodyValidationMiddleware } from "../../posts/middlewares/create-comments-body-validation.middleware";
import { iocContainer } from "../../composition-root";
import { CommentsController } from "./comments.controller";
import { reactionCommentsBodyValidationMiddleware } from "../middleware/reaction-comments-body-validation-middleware";
import { accessTokenOptionGuard } from "../../auth/middlewares/guards/access-token.option-guard";

const commentsController = iocContainer.resolve(CommentsController);
export const commentsRouter = Router({});

commentsRouter.use(EndpointList.BY_ID, accessTokenOptionGuard);

commentsRouter
  .get(
    EndpointList.BY_ID,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    commentsController.get.bind(commentsController),
  )
  .delete(
    EndpointList.BY_ID,
    accessTokenGuard,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    commentsController.delete.bind(commentsController),
  )
  .put(
    EndpointList.BY_ID,
    accessTokenGuard,
    paramIdValidationMiddleware,
    createCommentsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    commentsController.update.bind(commentsController),
  )
  .put(
    EndpointList.REACTIONS_FOR_COMMENTS,
    accessTokenGuard,
    paramIdValidationMiddleware,
    reactionCommentsBodyValidationMiddleware,
    inputValidationResultMiddleware,
    commentsController.updateCommentWithReaction.bind(commentsController),
  );
