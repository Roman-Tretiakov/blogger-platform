import { WithId } from "mongodb";
import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostViewModel } from "../BLL/dto/post-view-model-type";

export function mapToPostViewModel(post: WithId<PostMongoModel>): PostViewModel{
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
  }
}