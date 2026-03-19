import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import { LeanBlog } from "../repositories/schemas/blog.schema";

export function mapToBlogViewModel(blog: LeanBlog): BlogViewModel {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
}
