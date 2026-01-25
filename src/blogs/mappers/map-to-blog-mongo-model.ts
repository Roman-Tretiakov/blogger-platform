import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";
import { BlogInputModel } from "../BLL/dto/blog-input-dto";

export function mapToBlogMongoModel(blog: BlogInputModel): BlogMongoModel {
  return {
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  }
}