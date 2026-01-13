import { BlogViewModel } from "../core/types/blog-view-model-type";
import { PostViewModel } from "../core/types/post-view-model-type";

export const db = {
    blogs: <BlogViewModel[]>[
      {
        id: "1",
        name: "Research blog",
        description: "A blog about research",
        websiteUrl: "https://researchblog.com",
      },
      {
        id: "2",
        name: "Tech blog",
        description: "A blog about technology",
        websiteUrl: "https://techblog.com",
      },
      {
        id: "3",
        name: "Computer blog",
        description: "A blog about computers",
        websiteUrl: "https://computerblog.com",
      }
    ],
    posts: <PostViewModel[]>[
      {
        id: "1",
        title: "First Post",
        shortDescription: "This is the first post",
        content: "Content of the first post",
        blogId: "1",
        blogName: "Research blog",
      },
      {
        id: "2",
        title: "Second Post",
        shortDescription: "This is the second post",
        content: "Content of the second post",
        blogId: "2",
        blogName: "Tech blog",
      },
      {
        id: "3",
        title: "Third Post",
        shortDescription: "This is the third post",
        content: "Content of the third post",
        blogId: "3",
        blogName: "Computer blog",
      }
    ]
};
