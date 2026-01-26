import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostInputModel } from "../BLL/dto/post-input-dto";

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