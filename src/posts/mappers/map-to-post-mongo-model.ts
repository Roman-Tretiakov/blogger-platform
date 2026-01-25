import { PostMongoModel } from "../dto/post-mongo-model";
import { PostInputModel } from "../dto/post-input-dto";

export function mapToPostMongoModel(post: PostInputModel, additional?: any): PostMongoModel{
  return {
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: additional.name ?? "",
    createdAt: additional.createdAt ?? new Date().toISOString(),
  }
}