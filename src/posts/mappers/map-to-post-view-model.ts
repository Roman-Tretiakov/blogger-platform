import { PostViewModel } from "../BLL/types/post-view-model-type";
import { LeanPost } from "../../domain/posts/schema/post.schema";

export function mapToPostViewModel(post: LeanPost): PostViewModel {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
  };
}
