import { BlogMongoModel } from "../../dto/blog-mongo-model";
import { BlogInputModel } from "../../dto/blog-input-dto";

export function mapToBlogMongoModel(blog: BlogInputModel): BlogMongoModel {
  return {
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  }
}