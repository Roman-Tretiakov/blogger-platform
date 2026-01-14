import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { beforeEach } from "node:test";
import { PostInputModel } from "../../src/core/posts/dto/post-input-dto";

describe("Posts API tests", () => {
  const app = express();
  setupApp(app);

  const username = "admin";
  const password = "qwerty";
  const authString = `${username}:${password}`;
  const authValue: string = `Basic ${Buffer.from(authString).toString("base64")}`;

  const validPostBody: PostInputModel = {
    title: "Post name",
    shortDescription: "Test description",
    content: "cool content",
    blogId: "1",
  };

  beforeEach(async () => {
    const res = await request(app).delete(
      "/api/testing" + EndpointList.TEST_DELETE_ALL,
    );
    expect(res.status).toBe(HttpStatus.NoContent);
    expect(res.body).toEqual({});
  });

  test("should create valid post; POST /posts", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
    };
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send(newPost)
      .expect(HttpStatus.Created);
  });

  test("should not create invalid post; POST /posts", async () => {
    const newPost: any = {
      ...validPostBody,
      title: 1,
    };
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send(newPost)
      .expect(HttpStatus.BadRequest);
  });

  test("should not create unauthorized post; POST /posts", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
      title: "Test unauthorized",
    };
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .send(newPost)
      .expect(HttpStatus.Unauthorized);
  });

  test("should return posts list; GET /posts", async () => {
    await request(app).delete(
      "/api/testing" + EndpointList.TEST_DELETE_ALL,
    );
    const newPost1: PostInputModel = {
      ...validPostBody,
    };
    const newPost2: PostInputModel = {
      ...validPostBody,
      title: "Test post 2",
    };
    const newPost3: PostInputModel = {
      ...validPostBody,
      title: "Test post 3",
    };

    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost1 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost2 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost3 })
      .expect(HttpStatus.Created);

    const postListResponse = await request(app)
      .get(EndpointList.POSTS_PATH)
      .expect(HttpStatus.Ok);

    expect(postListResponse.body).toBeInstanceOf(Array);
    expect(postListResponse.body.length).toEqual(3);
  });

  test("should return post by id; GET /posts/:id", async () => {
    const newPost1: PostInputModel = {
      ...validPostBody,
    };
    const newPost2: PostInputModel = {
      ...validPostBody,
      title: "Test Post 2",
    };

    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost1 })
      .expect(HttpStatus.Created);
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost2 })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(EndpointList.POSTS_PATH + "/" + response.body.id)
      .expect(HttpStatus.Ok);
    expect(getResponse.body).toEqual({
      ...response.body,
    });

    await request(app)
      .get(EndpointList.POSTS_PATH + "/" + "10")
      .expect(HttpStatus.NotFound);
  });

  test("should update post by id; PUT /posts/:id", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
    };
    const updatedValidPost: PostInputModel = {
      ...newPost,
      title: "Test Post 2",
    };
    const updatedInvalidPost: any = {
      ...newPost,
      title: 1,
    };

    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost })
      .expect(HttpStatus.Created);

    await request(app)
      .put(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authValue)
      .send({ ...updatedValidPost })
      .expect(HttpStatus.NoContent);
    await request(app)
      .put(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authValue)
      .send({ ...updatedInvalidPost })
      .expect(HttpStatus.BadRequest);
    await request(app)
      .put(EndpointList.POSTS_PATH + "/" + response.body.id)
      .send({ ...updatedValidPost })
      .expect(HttpStatus.Unauthorized);
    await request(app)
      .put(EndpointList.POSTS_PATH + "/" + "5")
      .set("Authorization", authValue)
      .send({ ...updatedValidPost })
      .expect(HttpStatus.NotFound);

  });

  test("should delete post by id; DELETE /posts/:id", async () => {
    const newPost: PostInputModel = {
      ...validPostBody,
    };
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({ ...newPost})
      .expect(HttpStatus.Created);

    await request(app)
      .delete(EndpointList.POSTS_PATH + "/" + response.body.id)
      .set("Authorization", authValue)
      .expect(HttpStatus.NoContent);
    await request(app)
      .delete(EndpointList.POSTS_PATH + "/" + response.body.id)
      .expect(HttpStatus.Unauthorized);
    await request(app)
      .delete(EndpointList.POSTS_PATH + "/" + "102")
      .set("Authorization", authValue)
      .expect(HttpStatus.NotFound);
  });
});
