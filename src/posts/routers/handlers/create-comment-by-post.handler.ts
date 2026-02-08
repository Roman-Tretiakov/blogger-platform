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

  const result = await commentsService.createCommentByPostId(postId, content, userId, userLogin);
  if (result.status !== ResultStatus.Created) {
    res.status(resultStatusToHttpStatusMapper(result.status)).send(result.errorMessage);
    return;
  }

  const comment = await commentsQueryRepository.getById(result.data!)
  if (comment.status !== ResultStatus.Success) {
    res.status(HttpStatus.NotFound).send(result.errorMessage);
    return;
  }

  res.status(HttpStatus.Created).send(comment.data)
}