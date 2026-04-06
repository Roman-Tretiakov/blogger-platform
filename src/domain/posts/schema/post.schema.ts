import mongoose, { Schema, Types } from "mongoose";
import { IPost } from "../types/interfaces";

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const PostModel = mongoose.model<IPost>("Post", PostSchema, "posts");
export type LeanPost = IPost & { _id: Types.ObjectId };
