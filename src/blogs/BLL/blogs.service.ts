import { blogsRepository } from "../repositories/blogs.repository";
import { BlogViewModel } from "../dto/blog-view-model-type";
import { mapToBlogMongoModel } from "../mappers/map-to-blog-mongo-model";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { BlogInputModel } from "../dto/blog-input-dto";

export const blogsService = {
  async findAll(): Promise<BlogViewModel[]> {
    return (await blogsRepository.findAll()).map(mapToBlogViewModel);
  },

  async findById(id: string): Promise<BlogViewModel | null> {
    const blog = await blogsRepository.findById(id);
    if (blog === null) {
      throw new Error(`No blog found by id: ${id}`);
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
