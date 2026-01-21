import { PostViewModel } from "../../core/types/post-view-model-type";
import { postsCollection } from "../../db/mongo.db";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { PostMongoModel } from "../dto/post-mongo-model";

export const postsRepository = {
  async findAll(): Promise<WithId<PostMongoModel>[]> {
    return postsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<PostMongoModel> | null> {
    return (await postsCollection.findOne({ _id: new ObjectId(id) })) ?? null;
  },

  async create(post: PostMongoModel): Promise<WithId<PostMongoModel>> {
    const newPost: InsertOneResult<PostViewModel> =
      await postsCollection.insertOne(post);
    if (!newPost) {
      throw new Error("Failed to insert post");
    }
    return { ...post, _id: newPost.insertedId };
  },

  async update(id: string, updateModel: PostMongoModel): Promise<void> {
    const post: UpdateResult<PostViewModel> = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateModel },
    );

    if (post.matchedCount < 1) {
      throw new Error(`Post with id ${id} not found`);
    }
    return;
  },

  async delete(id: string): Promise<void> {
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount < 1) {
      throw new Error(`Post with id ${id} not found`);
    }
    return;
  },

  async clear(): Promise<void> {
    await postsCollection.drop();
  },
};
