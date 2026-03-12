import { BlogsRepository } from "../repositories/blogs.repository";
import { mapToBlogMongoModel } from "../mappers/map-to-blog-mongo-model";
import { BlogInputModel } from "./dto/blog-input-dto";
import { inject, injectable } from "inversify";

@injectable()
export class BlogsService {
  constructor(
    @inject(BlogsRepository)
    private blogsRepository: BlogsRepository,
  ) {}

  async create(blog: BlogInputModel): Promise<string> {
    const mongoMappedModel = mapToBlogMongoModel(blog);
    return await this.blogsRepository.create(mongoMappedModel);
  }

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    await this.blogsRepository.update(id, updateModel);
  }

  async delete(id: string): Promise<void> {
    await this.blogsRepository.delete(id);
  }

  async clear(): Promise<void> {
    await this.blogsRepository.clear();
  }
}
