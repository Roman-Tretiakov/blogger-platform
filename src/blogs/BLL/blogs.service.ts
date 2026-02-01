import { blogsRepository } from "../repositories/blogs.repository";
import { mapToBlogMongoModel } from "../mappers/map-to-blog-mongo-model";
import { BlogInputModel } from "./dto/blog-input-dto";

export const blogsService = {
  async create(blog: BlogInputModel): Promise<string> {
    const mongoMappedModel = mapToBlogMongoModel(blog);
    return await blogsRepository.create(mongoMappedModel);
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
