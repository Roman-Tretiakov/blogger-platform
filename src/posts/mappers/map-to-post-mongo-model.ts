import { PostMongoModel } from "../BLL/types/post-mongo-model";
import {
  BlogPostInputModel,
  PostInputModel,
} from "../BLL/types/post-input-dto";

export function mapToPostMongoModel(
  post: PostInputModel | BlogPostInputModel,
  additional: { id: string; blogName: string },
): PostMongoModel {
  return {
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: "blogId" in post ? (post as PostInputModel).blogId : additional.id,
    blogName: additional.blogName,
    createdAt: new Date().toISOString(),
  };
}
