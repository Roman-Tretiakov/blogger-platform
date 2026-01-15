import { PostInputModel } from "../dto/post-input-dto";
import { PostViewModel } from "../../types/post-view-model-type";
import { blogsCollection, postsCollection } from "../../../db/mongo.db";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";

export const postsRepository = {
  async findAll(): Promise<WithId<PostViewModel>[]> {
    return postsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<PostViewModel> | null> {
    return (await postsCollection.findOne({ _id: new ObjectId(id) })) ?? null;
  },

  async create(post: PostInputModel): Promise<WithId<PostViewModel>> {
    const blog = await blogsCollection.findOne({
      _id: new ObjectId(post.blogId),
    });
    if (!blog) {
      throw new Error(`No blog by blogId: ${post.blogId} found for post.`);
    }
    const name = blog.name;
    const newPost: InsertOneResult<PostViewModel> =
      await postsCollection.insertOne(post);
    return { ...post, blogName: name, _id: newPost.insertedId };
  },

  async update(id: string, updateModel: PostInputModel): Promise<void> {
    const post: UpdateResult<PostViewModel> | undefined =
      await postsCollection.updateOne(
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
    await  postsCollection.drop();
  }
};
