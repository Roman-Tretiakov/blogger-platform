import { injectable } from "inversify";
import {
  CommentReactionModel,
  ICommentReaction,
  LeanCommentReaction,
} from "../schema/comment-reaction.schema";
import { LikesStatus } from "../../comments/enums/like-status";

@injectable()
export class CommentReactionQueryRepository {
  async findReaction(
    commentId: string,
    userId: string,
  ): Promise<LeanCommentReaction | null> {
    return CommentReactionModel.findOne({ commentId, userId }).lean();
  }

  async findReactionById(id: string): Promise<LeanCommentReaction | null> {
    return CommentReactionModel.findById(id).lean();
  }

  // Получить статус реакции пользователя (для ответа API)
  async getUserStatus(
    commentId: string,
    userId?: string,
  ): Promise<LikesStatus> {
    if (userId) {
      const reaction = await this.findReaction(commentId, userId);
      return reaction ? reaction.status : LikesStatus.None;
    }
    return LikesStatus.None;
  }

  async findReactionByCommentId(
    commentId: string,
  ): Promise<ICommentReaction[]> {
    return CommentReactionModel.find({ commentId }).lean();
  }
}
