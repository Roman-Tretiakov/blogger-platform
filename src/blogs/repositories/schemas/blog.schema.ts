import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBlog extends Document {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

const BlogSchema = new Schema<IBlog>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, default: false },
});

export const BlogModel = mongoose.model<IBlog>("Blog", BlogSchema);
export type LeanBlog = IBlog & { _id: Types.ObjectId };
