import { CommentViewModel } from "../routers/outputTypes/comment-view-model";
import { LeanComment } from "../repositories/schemas/comment.schema";
import { LikesStatus } from "../enums/like-status";

export function mapToCommentViewModel(
  comment: LeanComment,
  myStatus: LikesStatus = LikesStatus.None,
): CommentViewModel {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: myStatus,
    },
  };
}
