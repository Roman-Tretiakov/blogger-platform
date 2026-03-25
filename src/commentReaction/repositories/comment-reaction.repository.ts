import { injectable } from "inversify";
import { CommentReactionModel } from "../schema/comment-reaction.schema";
import { LikesStatus } from "../../comments/enums/like-status";

@injectable()
export class CommentReactionRepository {
  // Создать или обновить реакцию (upsert = insert if not exists, update if exists)
  async upsertReaction(
    commentId: string,
    userId: string,
    status: LikesStatus,
  ): Promise<string | null> {
    const upserted = await CommentReactionModel.updateOne(
      { commentId, userId },
      { $set: { status } },
      { upsert: true },
    );

    return upserted.upsertedId?.toString() ?? null;
  }

  // Удалить реакцию (когда ставят None)
  async deleteReaction(commentId: string, userId: string): Promise<void> {
    await CommentReactionModel.deleteOne({ commentId, userId });
  }

  async clear(): Promise<void> {
    await CommentReactionModel.deleteMany({});
  }
}
