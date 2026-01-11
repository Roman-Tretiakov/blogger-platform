import { db } from "../../../db/db";
import { PostInputModel } from "../dto/post-input-dto";
import { PostViewModel } from "../../types/post-view-model-type";

export const postsRepository = {
  findAll(): PostViewModel[] {
    return db.posts;
  },

  findById(id: string): PostViewModel | null {
    return db.posts.find((post: PostViewModel) => post.id === id) ?? null;
  },

  create(post: PostInputModel): PostViewModel | any {
    const index: number = db.blogs.findIndex((b) => b.id === post.blogId);
    if (index === -1) {
      throw new Error(`No blog by blogId: ${post.blogId} found for post.`);
    }
    const newPost: PostViewModel = {
      id:
        db.posts.length > 0
          ? (parseInt(db.posts[db.posts.length - 1].id) + 1).toString()
          : "1",
      blogName: db.blogs[index].name,
      ...post,
    };
    db.posts.push(newPost);
    return newPost;
  },

  update(id: string, updateModel: PostInputModel): void {
    const post: PostViewModel | undefined = db.posts.find(
      (post: PostViewModel) => post.id === id,
    );

    if (!post) {
      throw new Error(`Post with id ${id} not found`);
    }

    db.posts[+id] = Object.assign(post, updateModel);
  },

  delete(id: string): void {
    const index = db.posts.findIndex((post: PostViewModel) => post.id === id);

    if (index === -1) {
      throw new Error(`Post with id ${id} not found`);
    }

    db.posts.splice(index, 1);
  },

  clear(): void {
    db.posts = [];
  },
};
