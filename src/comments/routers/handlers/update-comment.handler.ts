import { Response } from "express";
import { RequestWithParamsAndBody } from "../../../core/types/request-types";
import { CommentInputModel } from "../inputTypes/comment-input-model";
import { commentsService } from "../../BLL/comments.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { HttpStatus } from "../../../core/enums/http-status";

export async function updateCommentByIdHandler(
  req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>,
  res: Response,
): Promise<void> {
  const commentId = req.params.id;
  const userId = req.userData!.userId;
  const content = req.body;

  const result = await commentsService.updateCommentById(commentId, userId, content);

  if (result.status !== ResultStatus.Success) {
    res.status(resultStatusToHttpStatusMapper(result.status)).send();
    return;
  }

  res.status(HttpStatus.NoContent).send();
}