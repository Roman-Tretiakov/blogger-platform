import { PostViewModel } from "../BLL/dto/post-view-model-type";
import { postsCollection } from "../../db/mongo.db";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostInputModel } from "../BLL/dto/post-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";

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
    if (!newPost.acknowledged) {
      throw new DomainError("Failed to insert post");
    }
    return { ...post, _id: newPost.insertedId };
  },

  async update(id: string, updateModel: PostInputModel): Promise<void> {
    const post: UpdateResult<PostViewModel> = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateModel },
    );
    if (post.matchedCount < 1) {
      throw new NotFoundError(`Post with id ${id} not found`, 'id');
    }
    return;
  },

  //TODO: transfer error raise to service level:
  async delete(id: string): Promise<void> {
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount < 1) {
      throw new NotFoundError(`Post with id ${id} not found`, 'id');
    }
    return;
  },

  async clear(): Promise<void> {
    await postsCollection.drop();
  },
};
