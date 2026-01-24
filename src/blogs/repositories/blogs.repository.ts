import { BlogViewModel } from "../domainType/blog-view-model-type";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { blogsCollection } from "../../db/mongo.db";
import { BlogMongoModel } from "../dto/blog-mongo-model";
import { BlogInputModel } from "../dto/blog-input-dto";

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
    return { ...blog, _id: newBlog.insertedId };
  },

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    const updateResult: UpdateResult<BlogViewModel> =
      await blogsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateModel },
      );
    if (updateResult.matchedCount < 1) {
      throw new Error(`No blog found by id: ${id}`);
    }
    return;
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new Error(`No blog found by id: ${id}`);
    }
    return;
  },

  async clear(): Promise<void> {
    await blogsCollection.drop();
  },
};
