import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { blogsCollection } from "../../db/mongo.db";
import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";
import { BlogInputModel } from "../BLL/dto/blog-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";

export const blogsRepository = {
  async findAll(): Promise<WithId<BlogMongoModel>[]> {
    return blogsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<BlogMongoModel> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(blog: BlogMongoModel): Promise<WithId<BlogMongoModel>> {
    const newBlog: InsertOneResult<BlogViewModel> =
      await blogsCollection.insertOne(blog);
    if (!newBlog.acknowledged) {
      throw new DomainError("Failed to insert blog");
    }
    return { ...blog, _id: newBlog.insertedId };
  },

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    const updateResult: UpdateResult<BlogViewModel> =
      await blogsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateModel },
      );
    if (updateResult.matchedCount < 1) {
      throw new NotFoundError(`No blog found by id: ${id}`, 'id');
    }
    return;
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new NotFoundError(`No blog found by id: ${id}`, 'id');
    }
    return;
  },

  async clear(): Promise<void> {
    await blogsCollection.drop();
  },
};
