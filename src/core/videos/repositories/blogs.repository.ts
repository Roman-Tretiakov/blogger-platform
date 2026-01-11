import { db } from "../../../db/db";
import { BlogInputModel } from "../dto/blog-input-dto";
import { BlogViewModel } from "../../types/blog-view-model-type";

export const blogsRepository = {
  findAll(): BlogViewModel[] {
    return db.blogs;
  },

  findById(id: string): BlogViewModel | null {
    return db.blogs.find((blog: BlogViewModel) => blog.id === id) ?? null;
  },

  create(blog: BlogInputModel): BlogViewModel {
    const newBlog: BlogViewModel = {
      id:
        db.posts.length > 0
          ? (parseInt(db.blogs[db.blogs.length - 1].id) + 1).toString()
          : "1",
      ...blog,
    };
    db.blogs.push(newBlog);
    return newBlog;
  },

  update(id: string, updateModel: BlogInputModel): void {
    const blog: BlogViewModel | undefined = db.blogs.find(
      (b: BlogViewModel) => b.id === id,
    );

    if (!blog) {
      throw new Error(`Blog with id ${id} not found`);
    }

    db.blogs[+id] = Object.assign(blog, updateModel);
  },

  delete(id: string): void {
    const index = db.blogs.findIndex(
      (blog: BlogViewModel) => blog.id === id,
    );

    if (index === -1) {
      throw new Error(`blog with id ${id} not found`);
    }

    db.blogs.splice(index, 1);
  },

  clear(): void {
    db.blogs = [];
  },
};
