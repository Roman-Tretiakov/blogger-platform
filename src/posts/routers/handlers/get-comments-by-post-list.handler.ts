import { Response } from "express";
import { RequestWithParamsAndQuery } from "../../../core/types/request-types";
import { CommentsQueryInput } from "../../../comments/routers/inputTypes/comments-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/utils/sort-and-pagination.utils";
import { postsQueryRepository } from "../../repositories/posts.query-repository";
import { HttpStatus } from "../../../core/enums/http-status";
import { commentsQueryRepository } from "../../../comments/repositories/comments.query-repository";
import { resultStatusToHttpStatusMapper } from "../../../core/utils/result-code-to-http-status.mapper";

export async function getCommentsByPostListHandler(
  req: RequestWithParamsAndQuery<{ id: string }, CommentsQueryInput>,
  res: Response,
): Promise<void> {
  const postId = req.params.id;
  const sanitizedQuery = matchedData<CommentsQueryInput>(req, {
    locations: ["query"],
    includeOptionals: true,
  });
  const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

  try {
    await postsQueryRepository.getPostById(postId);
  } catch (e) {
    res
      .status(HttpStatus.NotFound)
      .send("post for passed postId doesn't exist");
    return;
  }

  const result = await commentsQueryRepository.getCommentsByPost(postId, queryInput);
  res.status(resultStatusToHttpStatusMapper(result.status)).send(result.data)
}
