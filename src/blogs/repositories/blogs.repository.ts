import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";
import { BlogInputModel } from "../BLL/dto/blog-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";
import { injectable } from "inversify";
import { BlogModel, LeanBlog } from "./schemas/blog.schema";

@injectable()
export class BlogsRepository {
  async create(blog: BlogMongoModel): Promise<string> {
    const newBlog = await BlogModel.create(blog);
    if (!newBlog) {
      throw new DomainError("Failed to insert blog");
    }
    return newBlog._id.toString();
  }

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    const updateResult = await BlogModel.findByIdAndUpdate(id, {
      $set: updateModel,
    }).lean<LeanBlog>();
    if (!updateResult) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
  }

  async delete(id: string): Promise<void> {
    const deleteResult = await BlogModel.findByIdAndDelete(id).lean<LeanBlog>();
    if (!deleteResult) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
    return;
  }

  async clear(): Promise<void> {
    await BlogModel.deleteMany({});
  }
}
