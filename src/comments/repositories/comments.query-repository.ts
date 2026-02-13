import { Filter, ObjectId } from "mongodb";
import { Result } from "../../core/types/result-object-type";
import { commentsCollection } from "../../db/mongo.db";
import { ResultStatus } from "../../core/enums/result-statuses";
import { CommentViewModel } from "../routers/outputTypes/comment-view-model";
import { mapToCommentViewModel } from "../mappers/map-to-comment-view-model";
import { CommentListWithPagination } from "../routers/outputTypes/comment-list-with-pagination";
import { CommentsQueryInput } from "../routers/inputTypes/comments-query-input";
import { CommentMongoModel } from "./types/comment-mongo-model";

export const commentsQueryRepository = {
  async getById(commentId: string): Promise<Result<CommentViewModel | null>> {
    const comment = await commentsCollection.findOne({
      _id: new ObjectId(commentId),
    });
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
      data: comment ? mapToCommentViewModel(comment) : null,
    };
  },

  async getCommentsByPost(
    postId: string,
    queryInput: CommentsQueryInput,
  ): Promise<Result<CommentListWithPagination | null>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: Filter<CommentMongoModel> = {};

    filter.postId = postId;

    const items = await commentsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();
    const totalCount = await commentsCollection.countDocuments(filter);

    const commentList = {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: items.map(mapToCommentViewModel)
    };

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: commentList,
    };
  },
};
