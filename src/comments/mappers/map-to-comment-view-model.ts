import { CommentViewModel } from "../routers/outputTypes/comment-view-model";
import { LeanComment } from "../repositories/schemas/comment.schema";

export function mapToCommentViewModel(comment: LeanComment): CommentViewModel {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
  };
}
