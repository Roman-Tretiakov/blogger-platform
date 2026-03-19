import { BlogPostInputModel, PostInputModel } from "./dto/post-input-dto";
import { PostsRepository } from "../repositories/posts.repository";
import { mapToPostMongoModel } from "../mappers/map-to-post-mongo-model";
import { BlogsRepository } from "../../blogs/repositories/blogs.repository";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { CustomError } from "../../core/errorClasses/CustomError";
import { HttpStatus } from "../../core/enums/http-status";
import { inject, injectable } from "inversify";

@injectable()
export class PostsService {
  constructor(
    @inject(BlogsRepository)
    private blogsRepository: BlogsRepository,
    @inject(PostsRepository)
    private postsRepository: PostsRepository,
  ) {}

  async create(
    inputModel: PostInputModel | BlogPostInputModel,
    blogId?: string,
  ): Promise<string> {
    const blog = await this.blogsRepository.findById(
      blogId ?? (inputModel as PostInputModel).blogId,
    );
    if (blog === null) {
      throw new NotFoundError(
        `No blog found by id: ${blogId} for post`,
        "blogId",
      );
    }
    const mongoMappedModel = mapToPostMongoModel(inputModel, {
      id: blog._id.toString(),
      blogName: blog.name,
    });
    return await this.postsRepository.create(mongoMappedModel);
  }

  async update(id: string, updateModel: PostInputModel): Promise<void> {
    const blog = await this.blogsRepository.findById(updateModel.blogId);
    if (blog === null) {
      throw new CustomError(
        `No blog found by id: ${updateModel.blogId} for post`,
        "blogId",
        HttpStatus.NotFound,
      );
    }
    await this.postsRepository.update(id, updateModel);
  }

  async deleteById(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }

  async clear(): Promise<void> {
    await this.postsRepository.clear();
  }
}
