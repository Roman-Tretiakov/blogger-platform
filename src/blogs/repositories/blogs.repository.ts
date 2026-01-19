import { BlogViewModel } from "../../core/types/blog-view-model-type";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { blogsCollection } from "../../db/mongo.db";
import { BlogMongoModel } from "../dto/blog-mongo-model";

export const blogsRepository = {
  async findAll(): Promise<WithId<BlogMongoModel>[]> {
    return blogsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<BlogMongoModel> | null> {
    return (await blogsCollection.findOne({ _id: new ObjectId(id) })) ?? null;
  },

  async create(blog: BlogMongoModel): Promise<WithId<BlogMongoModel>> {
    const newBlog: InsertOneResult<BlogViewModel> =
      await blogsCollection.insertOne(blog);
    return { ...blog, _id: newBlog.insertedId };
  },

  async update(id: string, updateModel: BlogMongoModel): Promise<void> {
    const updateResult: UpdateResult<BlogViewModel> =
      await blogsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateModel },
      );
    if (updateResult.matchedCount < 1) {
      throw new Error("Blog not exist");
    }
    return;
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error("Blog not exist");
    }
    return;
  },

  async clear(): Promise<void> {
    await blogsCollection.drop();
  },
};
