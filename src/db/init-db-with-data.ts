import { BlogViewModel } from "../core/types/blog-view-model-type";
import { PostViewModel } from "../core/types/post-view-model-type";
import { blogsRepository } from "../core/blogs/repositories/blogs.repository";
import { postsRepository } from "../core/posts/repositories/posts.repository";

const db = {
  blogs: <BlogViewModel[]>[
    {
      name: "Research blog",
      description: "A blog about research",
      websiteUrl: "https://researchblog.com",
    },
    {
      name: "Tech blog",
      description: "A blog about technology",
      websiteUrl: "https://techblog.com",
    },
    {
      name: "Computer blog",
      description: "A blog about computers",
      websiteUrl: "https://computerblog.com",
    },
  ],
  posts: <PostViewModel[]>[
    {
      title: "First Post",
      shortDescription: "This is the first post",
      content: "Content of the first post",
      blogId: "1",
      blogName: "Research blog",
    },
    {
      title: "Second Post",
      shortDescription: "This is the second post",
      content: "Content of the second post",
      blogId: "2",
      blogName: "Tech blog",
    },
    {
      title: "Third Post",
      shortDescription: "This is the third post",
      content: "Content of the third post",
      blogId: "3",
      blogName: "Computer blog",
    },
  ],
};

export async function initDB(): Promise<void> {
  for (const blog of db.blogs) {
    await blogsRepository.create(blog);
  }

  for (const post of db.posts) {
    await postsRepository.create(post);
  }
}
