import { LikesStatus } from "../../comments/enums/like-status";
import { model, Schema, Types } from "mongoose";

export interface ICommentReaction extends Document {
  commentId: string;
  userId: string;
  status: LikesStatus;
}

const CommentReactionSchema = new Schema<ICommentReaction>({
  commentId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  status: { type: String, enum: Object.values(LikesStatus), required: true },
});

CommentReactionSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const CommentReactionModel = model<ICommentReaction>(
  "Reaction",
  CommentReactionSchema,
  "reactions",
);
export type LeanCommentReaction = ICommentReaction & { _id: Types.ObjectId };
