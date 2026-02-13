import { Response } from "express";
import { RequestWithParams } from "../../../core/types/request-types";
import { commentsService } from "../../BLL/comments.service";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";
import { HttpStatus } from "../../../core/enums/http-status";

export async function deleteCommentByIdHandler(
  req: RequestWithParams<{ id: string }>,
  res: Response,
): Promise<void> {
  const commentId = req.params.id;
  const userId = req.userData!.userId;
  const result = await commentsService.deleteCommentById(commentId, userId);

  if (result.status !== ResultStatus.Success) {
    res.status(resultStatusToHttpStatusMapper(result.status)).send();
    return;
  }

  res.status(HttpStatus.NoContent).send()
}
