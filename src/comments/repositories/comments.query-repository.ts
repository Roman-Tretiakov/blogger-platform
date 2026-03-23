import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { mapToCommentViewModel } from "../mappers/map-to-comment-view-model";
import { CommentListWithPagination } from "../routers/outputTypes/comment-list-with-pagination";
import { CommentsQueryInput } from "../routers/inputTypes/comments-query-input";
import { injectable } from "inversify";
import { CommentModel, LeanComment } from "./schemas/comment.schema";

@injectable()
export class CommentsQueryRepository {
  async getById(commentId: string): Promise<Result<LeanComment | null>> {
    const comment = await CommentModel.findById(commentId).lean<LeanComment>();
    return {
      status: comment ? ResultStatus.Success : ResultStatus.NotFound,
      errorMessage: comment ? "" : "Comment not found by this id",
      extensions: comment
        ? []
        : [
            {
              field: "commentId",
              message: "Comment not found by this id",
            },
          ],
      data: comment ? comment : null,
    };
  }

  async getCommentsByPost(
    postId: string,
    queryInput: CommentsQueryInput,
  ): Promise<Result<CommentListWithPagination | null>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: Record<string, any> = {};

    filter.postId = postId;

    const items = await CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();
    const totalCount = await CommentModel.countDocuments(filter);

    const commentList = {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: items.map(mapToCommentViewModel),
    };

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: commentList,
    };
  }
}
