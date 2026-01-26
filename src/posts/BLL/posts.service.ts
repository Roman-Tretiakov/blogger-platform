import { PostViewModel } from "./dto/post-view-model-type";
import { PostInputModel } from "./dto/post-input-dto";
import { postsRepository } from "../repositories/posts.repository";
import { mapToPostViewModel } from "../mappers/map-to-post-view-model";
import { mapToPostMongoModel } from "../mappers/map-to-post-mongo-model";
import { blogsRepository } from "../../blogs/repositories/blogs.repository";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { PostQueryInput } from "../routers/inputTypes/post-query-input";
import { PostListWithPagination } from "../routers/outputTypes/post-list-with-pagination";
import { postsQueryRepository } from "../repositories/posts-query.repository";

export const postsService = {
  async findAll(): Promise<PostViewModel[]> {
    return (await postsRepository.findAll()).map(mapToPostViewModel);
  },

  async findMany(queryInput: PostQueryInput): Promise<PostListWithPagination> {
    const { items, totalCount } =
      await postsQueryRepository.findMany(queryInput);

    return {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount,
      items: items.map(mapToPostViewModel),
    };
  },

  async findById(id: string): Promise<PostViewModel> {
    const post = await postsRepository.findById(id);
    if (post === null) {
      throw new NotFoundError(`No post found by id: ${id}`, "id");
    }
    return mapToPostViewModel(post);
  },

  async create(inputModel: PostInputModel): Promise<PostViewModel> {
    const blog = await blogsRepository.findById(inputModel.blogId);
    if (blog === null) {
      throw new NotFoundError(
        `No blog found by id: ${inputModel.blogId} for post`,
        "blogId",
      );
    }
    const mongoMappedModel = mapToPostMongoModel(inputModel, blog);
    return mapToPostViewModel(await postsRepository.create(mongoMappedModel));
  },

  async update(id: string, updateModel: PostInputModel): Promise<void> {
    const blog = await blogsRepository.findById(updateModel.blogId);
    if (blog === null) {
      throw new NotFoundError(
        `No blog found by id: ${updateModel.blogId} for post`,
        "blogId",
      );
    }
    await postsRepository.update(id, updateModel);
  },

  async delete(id: string): Promise<void> {
    await postsRepository.delete(id);
  },

  async clear(): Promise<void> {
    await postsRepository.clear();
  },
};
