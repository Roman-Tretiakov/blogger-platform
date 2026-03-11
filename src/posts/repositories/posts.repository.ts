import { PostViewModel } from "../BLL/dto/post-view-model-type";
import { Collection, ObjectId, UpdateResult } from "mongodb";
import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostInputModel } from "../BLL/dto/post-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";

export class PostsRepository {
  constructor(private collection: Collection<PostMongoModel>) {}

  async create(post: PostMongoModel): Promise<string> {
    const newPost = await this.collection.insertOne(post);
    if (!newPost.acknowledged) {
      throw new DomainError("Failed to insert post");
    }
    return newPost.insertedId.toString();
  }

  async update(id: string, updateModel: PostInputModel): Promise<void> {
    const post: UpdateResult<PostViewModel> = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateModel },
    );
    if (post.matchedCount < 1) {
      throw new NotFoundError(`Post with id ${id} not found`, "id");
    }
    return;
  }

  async delete(id: string): Promise<void> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount < 1) {
      throw new NotFoundError(`Post with id ${id} not found`, "id");
    }
    return;
  }

  async clear(): Promise<void> {
    await this.collection.drop();
  }
}
