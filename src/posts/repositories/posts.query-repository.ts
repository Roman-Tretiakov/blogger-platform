import { ObjectId } from "mongodb";
import { PostQueryInput } from "../routers/inputTypes/post-query-input";
import { PostViewModel } from "../BLL/dto/post-view-model-type";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { mapToPostViewModel } from "../mappers/map-to-post-view-model";
import { BlogsQueryRepository } from "../../blogs/repositories/blogs.query-repository";
import { PostListWithPagination } from "../routers/outputTypes/post-list-with-pagination";
import { inject, injectable } from "inversify";
import { PostModel } from "./schemas/post.schema";

@injectable()
export class PostsQueryRepository {
  constructor(
    @inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getPostById(id: string): Promise<PostViewModel> {
    const post = await PostModel.findOne({ _id: new ObjectId(id) });
    if (post === null) {
      throw new NotFoundError(`Post with id: ${id} not found`, "id");
    }
    return mapToPostViewModel(post);
  }

  async findMany(
    queryInput: PostQueryInput,
    blogId?: string,
  ): Promise<PostListWithPagination> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: Record<string, any> = {};

    if (blogId) {
      if ((await this.blogsQueryRepository.getBlogById(blogId)) === null) {
        throw new NotFoundError(
          `No blog found by id: ${blogId} for post`,
          "blogId",
        );
      }
      filter.blogId = blogId;
    }

    if (searchNameTerm) {
      filter.title = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalCount = await PostModel.countDocuments(filter);
    return {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: items.map(mapToPostViewModel),
    };
  }
}
