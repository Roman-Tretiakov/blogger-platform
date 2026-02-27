import { CommentMongoModel } from "../repositories/types/comment-mongo-model";
import { WithId } from "mongodb";
import { CommentViewModel } from "../routers/outputTypes/comment-view-model";

export function mapToCommentViewModel(
  comment: WithId<CommentMongoModel>,
): CommentViewModel {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
  };
}
