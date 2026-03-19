import { BlogQueryInput } from "../routers/inputTypes/blog-query-input";
import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { BlogListWithPagination } from "../routers/outputTypes/blog-list-with-pagination";
import { injectable } from "inversify";
import { BlogModel, LeanBlog } from "./schemas/blog.schema";

@injectable()
export class BlogsQueryRepository {
  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const blog = await BlogModel.findById(id).lean<LeanBlog>();
    if (blog === null) {
      return null;
    }
    return mapToBlogViewModel(blog);
  }

  async findMany(queryInput: BlogQueryInput): Promise<BlogListWithPagination> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: Record<string, any> = {};

    if (searchNameTerm) {
      filter["name"] = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalCount = await BlogModel.countDocuments(filter);
    return {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: items.map(mapToBlogViewModel),
    };
  }
}
