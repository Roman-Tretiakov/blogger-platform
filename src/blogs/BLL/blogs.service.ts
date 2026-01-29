import { blogsRepository } from "../repositories/blogs.repository";
import { BlogViewModel } from "./dto/blog-view-model-type";
import { mapToBlogMongoModel } from "../mappers/map-to-blog-mongo-model";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { BlogInputModel } from "./dto/blog-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { BlogQueryInput } from "../routers/inputTypes/blog-query-input";
import { BlogListWithPagination } from "../routers/outputTypes/blog-list-with-pagination";
import { blogsQueryRepository } from "../repositories/blogs.query-repository";

export const blogsService = {
  async findAll(): Promise<BlogViewModel[]> {
    return (await blogsRepository.findAll()).map(mapToBlogViewModel);
  },

  async findMany(queryInput: BlogQueryInput): Promise<BlogListWithPagination> {
    const { items, totalCount } =
      await blogsQueryRepository.findMany(queryInput);

    return {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount,
      items: items.map(mapToBlogViewModel),
    };
  },

  async findById(id: string): Promise<BlogViewModel | null> {
    const blog = await blogsRepository.findById(id);
    if (blog === null) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
    return mapToBlogViewModel(blog);
  },

  async create(blog: BlogInputModel): Promise<BlogViewModel> {
    const mongoMappedModel = mapToBlogMongoModel(blog);
    return mapToBlogViewModel(await blogsRepository.create(mongoMappedModel));
  },

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    await blogsRepository.update(id, updateModel);
  },

  async delete(id: string): Promise<void> {
    await blogsRepository.delete(id);
  },

  async clear(): Promise<void> {
    await blogsRepository.clear();
  },
};
