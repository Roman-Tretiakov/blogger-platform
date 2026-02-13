import { Response } from "express";
import { RequestWithParamsAndBody } from "../../../core/types/request-types";
import { CommentInputModel } from "../../../comments/routers/inputTypes/comment-input-model";
import { commentsService } from "../../../comments/BLL/comments.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { usersQueryRepository } from "../../../users/repositories/users.query-repository";
import { commentsQueryRepository } from "../../../comments/repositories/comments.query-repository";
import { HttpStatus } from "../../../core/enums/http-status";

export async function createCommentByPostHandler(
  req: RequestWithParamsAndBody<{id: string}, CommentInputModel>,
  res: Response
): Promise<void>{
  const postId = req.params.id;
  const content = req.body.content;
  const userId = req.userData!.userId;
  const userLogin = await usersQueryRepository.getMe(userId).then(u => u.login);

  const postResult = await commentsService.createCommentByPostId(postId, content, userId, userLogin);
  if (postResult.status !== ResultStatus.Created) {
    res.status(resultStatusToHttpStatusMapper(postResult.status)).send(postResult.errorMessage);
    return;
  }

  const commentResult = await commentsQueryRepository.getById(postResult.data!)
  if (commentResult.status !== ResultStatus.Success) {
    res.status(HttpStatus.NotFound).send(postResult.errorMessage);
    return;
  }

  res.status(HttpStatus.Created).send(commentResult.data)
}