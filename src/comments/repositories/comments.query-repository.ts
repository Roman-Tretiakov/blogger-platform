import { ObjectId } from "mongodb";
import { Result } from "../../core/types/result-object-type";
import { commentsCollection } from "../../db/mongo.db";
import { ResultStatus } from "../../core/enums/result-statuses";
import { CommentViewModel } from "../routers/outputTypes/comment-view-model";
import { mapToCommentViewModel } from "../mappers/map-to-comment-view-model";

export const commentsQueryRepository = {
  async getById(
    commentId: string,
  ): Promise<Result<CommentViewModel | null>> {
    const comment = await commentsCollection.findOne({
      _id: new ObjectId(commentId),
    });
    return {
      status: comment ? ResultStatus.Success : ResultStatus.NotFound,
      errorMessage: comment ? "" : "Comment not found by this id",
      extensions: comment ? [] : [
        {
          field: "commentId",
          message: "Comment not found by this id"
        }
      ],
      data: comment ? mapToCommentViewModel(comment) : null
    };
  },
};
