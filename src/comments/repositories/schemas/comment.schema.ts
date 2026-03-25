import { Schema, Document, Types, model } from "mongoose";

export interface IComment extends Document {
  content: string;
  postId: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
}

const CommentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  postId: { type: String, required: true },
  commentatorInfo: {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  createdAt: { type: String, required: true },
  likesInfo: {
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
  },
});

export const CommentModel = model<IComment>(
  "Comment",
  CommentSchema,
  "comments",
);
export type LeanComment = IComment & { _id: Types.ObjectId };
