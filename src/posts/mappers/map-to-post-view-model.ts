import { PostViewModel } from "../BLL/dto/post-view-model-type";
import { LeanPost } from "../repositories/schemas/post.schema";

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
