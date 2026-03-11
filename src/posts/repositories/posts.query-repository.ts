import { Collection, Filter, ObjectId } from "mongodb";
import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostQueryInput } from "../routers/inputTypes/post-query-input";
import { PostViewModel } from "../BLL/dto/post-view-model-type";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { mapToPostViewModel } from "../mappers/map-to-post-view-model";
import { BlogsQueryRepository } from "../../blogs/repositories/blogs.query-repository";
import { PostListWithPagination } from "../routers/outputTypes/post-list-with-pagination";

export class PostsQueryRepository {
  constructor(
    private collection: Collection<PostMongoModel>,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getPostById(id: string): Promise<PostViewModel> {
    const post = await this.collection.findOne({ _id: new ObjectId(id) });
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
    const filter: Filter<PostMongoModel> = {};

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

    const items = await this.collection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await this.collection.countDocuments(filter);
    return {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: items.map(mapToPostViewModel),
    };
  }
}
