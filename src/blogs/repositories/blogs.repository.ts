import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import { ObjectId, UpdateResult, WithId } from "mongodb";
import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";
import { BlogInputModel } from "../BLL/dto/blog-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";
import { injectable } from "inversify";
import { BlogModel } from "./schemas/blog.schema";

@injectable()
export class BlogsRepository {
  async findById(id: string): Promise<WithId<BlogMongoModel>> {
    const blog = await BlogModel.findById(id).lean();
    if (blog === null) {
      throw new NotFoundError(`Blog with id: ${id} not found`, "id");
    }
    return blog;
  }

  async create(blog: BlogMongoModel): Promise<string> {
    const newBlog = await BlogModel.create(blog);
    if (!newBlog) {
      throw new DomainError("Failed to insert blog");
    }
    return newBlog._id.toString();
  }

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    const updateResult: UpdateResult<BlogViewModel> = await BlogModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateModel },
    );
    if (updateResult.matchedCount < 1) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
    return;
  }

  async delete(id: string): Promise<void> {
    const deleteResult = await BlogModel.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
    return;
  }

  async clear(): Promise<void> {
    await BlogModel.deleteMany({});
  }
}
