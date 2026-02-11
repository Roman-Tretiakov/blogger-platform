import request from "supertest";
import express, { Express } from "express";
import { setupApp } from "../../src/setup-app";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { PostInputModel } from "../../src/posts/BLL/dto/post-input-dto";
//@ts-ignore
import { getBasicAuthToken } from "../utils/get-basic-auth-token";
import { client, closeDBConnection, runDB } from "../../src/db/mongo.db";
//@ts-ignore
import { BlogInputModel } from "../../src/blogs/BLL/dto/blog-input-dto";
import { postsService } from "../../src/posts/BLL/posts.service";

let app: Express;
let blog_id: string;
const authToken: string = getBasicAuthToken();
let validPostBody: PostInputModel;
let createdBlog: BlogInputModel;

describe("Posts API tests", () => {
  validPostBody = {
    title: "Post name",
    shortDescription: "Test description",
    content: "cool content",
    blogId: "",
  };
  createdBlog = {
    name: "Test Blog",
    description: "Test description",
    websiteUrl: "https://samurai.io",
  };

  beforeAll(async () => {
    await runDB(
      "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
    );
    app = express();
    setupApp(app);

    const blog = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...createdBlog })
      .expect(HttpStatus.Created);
    blog_id = blog.body.id;

    await postsService.clear();
  });

  beforeEach(async () => {
    await postsService.clear();
  });

  afterAll(async () => {
    try {
      await closeDBConnection(client);
    } catch (error) {
      console.error("Error closing DB connection:", error);
      // Можно не бросать ошибку дальше, чтобы не влиять на результат тестов
    }
  });

  // TESTS:
  test("should create valid post; POST api/posts", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
      blogId: blog_id,
    };
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send(newPost)
      .expect(HttpStatus.Created);
  });

  test("should not create invalid post; POST /posts", async () => {
    const newPost: any = {
      ...validPostBody,
      title: 1,
      blogId: blog_id,
    };
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send(newPost)
      .expect(HttpStatus.BadRequest);
  });

  test("should not create invalid post; POST /blogs/:blogId/posts", async () => {
    const newPost: any = {
      ...validPostBody,
      title: "title",
      blogId: blog_id,
    };
    await request(app)
      .post(`${EndpointList.BLOGS_PATH}/63189b06003380064c4193be/posts`)
      .set("Authorization", authToken)
      .send(newPost)
      .expect(HttpStatus.NotFound);
  });

  test("should not create unauthorized post; POST /posts", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
      title: "Test unauthorized",
      blogId: blog_id,
    };
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .send(newPost)
      .expect(HttpStatus.Unauthorized);
  });

  test("Should create new post for specific blog; POST /blogs/:blogId/posts", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
      blogId: blog_id,
    };
    const response = await request(app)
      .post(`${EndpointList.BLOGS_PATH}/${newPost.blogId}/posts`)
      .set("Authorization", authToken)
      .send(newPost)
      .expect(HttpStatus.Created);

    const getPost = await request(app)
      .get(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.Ok);

    expect(getPost.body.id).toEqual(response.body.id);
  });

  test("should return posts list; GET /posts", async () => {
    const newPost1: PostInputModel = {
      ...validPostBody,
      blogId: blog_id,
    };
    const newPost2: PostInputModel = {
      ...validPostBody,
      title: "Test post 2",
      blogId: blog_id,
    };
    const newPost3: PostInputModel = {
      ...validPostBody,
      title: "Test post 3",
      blogId: blog_id,
    };

    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send({ ...newPost1 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send({ ...newPost2 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send({ ...newPost3 })
      .expect(HttpStatus.Created);

    const postListResponse = await request(app)
      .get(EndpointList.POSTS_PATH)
      .expect(HttpStatus.Ok);

    expect(postListResponse.body).toBeInstanceOf(Array);
    expect(postListResponse.body.length).toBeGreaterThanOrEqual(3);
  });

  test("should return post by id; GET /posts/:id", async () => {
    const newPost1: PostInputModel = {
      ...validPostBody,
      blogId: blog_id,
    };

    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send({ ...newPost1 })
      .expect(HttpStatus.Created);

    const getPost = await request(app)
      .get(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.Ok);

    expect(getPost.body).toEqual({
      ...response.body,
    });
  });

  test("should update post by id; PUT /posts/:id", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
      blogId: blog_id,
    };
    const updatedValidPost: PostInputModel = {
      ...newPost,
      title: "Test Post 2",
      blogId: blog_id,
    };

    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send({ ...newPost })
      .expect(HttpStatus.Created);

    await request(app)
      .put(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .send({ ...updatedValidPost })
      .expect(HttpStatus.NoContent);
    const result = await request(app)
      .get(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.Ok);
    expect(result.body.title).toEqual(updatedValidPost.title);
  });

  test("should delete post by id; DELETE /posts/:id", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
      blogId: blog_id,
    };
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authToken)
      .send({ ...newPost })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.NoContent);
    await request(app)
      .get(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.NotFound);
  });
});
