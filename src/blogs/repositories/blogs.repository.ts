import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import {
  Collection,
  InsertOneResult,
  ObjectId,
  UpdateResult,
  WithId,
} from "mongodb";
import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";
import { BlogInputModel } from "../BLL/dto/blog-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";

export class BlogsRepository {
  constructor(private collection: Collection<BlogMongoModel>) {}

  async findAll(): Promise<WithId<BlogMongoModel>[]> {
    return this.collection.find().toArray();
  }

  async findById(id: string): Promise<WithId<BlogMongoModel>> {
    const blog = await this.collection.findOne({ _id: new ObjectId(id) });
    if (blog === null) {
      throw new NotFoundError(`Blog with id: ${id} not found`, "id");
    }
    return blog;
  }

  async create(blog: BlogMongoModel): Promise<string> {
    const newBlog: InsertOneResult<BlogMongoModel> =
      await this.collection.insertOne(blog);
    if (!newBlog.acknowledged) {
      throw new DomainError("Failed to insert blog");
    }
    return newBlog.insertedId.toString();
  }

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    const updateResult: UpdateResult<BlogViewModel> =
      await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateModel },
      );
    if (updateResult.matchedCount < 1) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
    return;
  }

  async delete(id: string): Promise<void> {
    const deleteResult = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new NotFoundError(`No blog found by id: ${id}`, "id");
    }
    return;
  }

  async clear(): Promise<void> {
    await this.collection.drop();
  }
}
