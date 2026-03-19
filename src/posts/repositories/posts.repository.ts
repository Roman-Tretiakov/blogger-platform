import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostInputModel } from "../BLL/dto/post-input-dto";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { DomainError } from "../../core/errorClasses/DomainError";
import { injectable } from "inversify";
import { PostModel } from "./schemas/post.schema";

@injectable()
export class PostsRepository {
  async create(post: PostMongoModel): Promise<string> {
    const newPost = await PostModel.create(post);
    if (!newPost) {
      throw new DomainError("Failed to insert post");
    }
    return newPost._id.toString();
  }

  async update(id: string, updateModel: PostInputModel): Promise<void> {
    const post = await PostModel.findByIdAndUpdate(id, { $set: updateModel });
    if (!post) {
      throw new NotFoundError(`Post with id ${id} not found`, "id");
    }
  }

  async delete(id: string): Promise<void> {
    const result = await PostModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError(`Post with id ${id} not found`, "id");
    }
  }

  async clear(): Promise<void> {
    await PostModel.deleteMany({});
  }
}
