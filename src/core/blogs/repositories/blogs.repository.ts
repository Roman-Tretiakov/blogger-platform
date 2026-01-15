import { BlogInputModel } from "../dto/blog-input-dto";
import { BlogViewModel } from "../../types/blog-view-model-type";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { blogsCollection } from "../../../db/mongo.db";

export const blogsRepository = {
  async findAll(): Promise<WithId<BlogViewModel>[]>  {
    return blogsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<BlogViewModel> | null> {
    return await blogsCollection.findOne({ _id: new ObjectId(id) }) ?? null;
  },

  async create(blog: BlogInputModel): Promise<WithId<BlogViewModel>> {
    const newBlog: InsertOneResult<BlogViewModel> = await blogsCollection.insertOne(blog);
      return { ...blog, _id: newBlog.insertedId};
  },

  async update(id: string, updateModel: BlogInputModel): Promise<void> {
    const blog: UpdateResult<BlogViewModel> | undefined = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateModel }
    )

    if (blog.matchedCount < 1) {
      throw new Error(`Blog with id ${id} not found`);
    }
    return;
  },

  async delete(id: string): Promise<void> {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount < 1) {
      throw new Error(`blog with id ${id} not found`);
    }
    return;
  },

  async clear(): Promise<void> {
    await blogsCollection.drop()
  }
};
