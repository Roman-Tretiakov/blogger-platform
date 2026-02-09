import { Response } from "express";
import { RequestWithParams } from "../../../core/types/request-types";
import { commentsQueryRepository } from "../../repositories/comments.query-repository";
import { ResultStatus } from "../../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";

export async function getCommentByIdHandler(
  req: RequestWithParams<{id: string}>,
  res: Response
): Promise<void>{
    const commentId = req.params.id;
    const result = await commentsQueryRepository.getById(commentId);

    if (result.status !== ResultStatus.Success) {
      res.status(resultStatusToHttpStatusMapper(result.status)).send();
      return;
    }

    res.status(resultStatusToHttpStatusMapper(result.status)).send(result.data);
}