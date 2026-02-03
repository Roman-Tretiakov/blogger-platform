import { PostViewModel } from "../BLL/dto/post-view-model-type";
import { postsCollection } from "../../db/mongo.db";
import { ObjectId, UpdateResult } from "mongodb";
import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostInputModel } from "../BLL/dto/post-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";

export const postsRepository = {
  async create(post: PostMongoModel): Promise<string> {
    const newPost =
      await postsCollection.insertOne(post);
    if (!newPost.acknowledged) {
      throw new DomainError("Failed to insert post");
    }
    return newPost.insertedId.toString();
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
