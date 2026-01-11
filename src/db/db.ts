import VideoModel from "../core/types/video-model-type";
import { BlogViewModel } from "../core/types/blog-view-model-type";
import { PostViewModel } from "../core/types/post-view-model-type";

export const db = {
    videos: <VideoModel[]>[
        {
            id: 1,
            title: "Властелин колец",
            author: "Питер Джексон",
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: "2006-01-01T12:00:00.000Z",
            publicationDate: "2006-01-02T12:00:00.000Z",
            availableResolutions: ["P144", "P240", "P360"],
        },
        {
            id: 2,
            title: "Слово пацана",
            author: "Джон Винн",
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: "2024-02-01T12:00:00.000Z",
            publicationDate: "2024-02-02T12:00:00.000Z",
            availableResolutions: ["P480", "P720"],
        },
        {
            id: 3,
            title: "Jurassic Park",
            author: "Steven Spielberg",
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: "2021-02-01T12:00:00.000Z",
            publicationDate: "2021-02-02T12:00:00.000Z",
            availableResolutions: ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"],
        }
    ],
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
