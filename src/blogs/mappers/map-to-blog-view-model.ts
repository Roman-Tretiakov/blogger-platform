import { BlogViewModel } from "../dto/blog-view-model-type";
import { WithId } from "mongodb";
import { BlogMongoModel } from "../dto/blog-mongo-model";

export function mapToBlogViewModel(blog: WithId<BlogMongoModel>): BlogViewModel {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership
  }
}