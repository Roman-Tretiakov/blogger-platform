import express from "express";
import request from "supertest";
import { setupApp } from "../../src/setup-app";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { HttpStatus } from "../../src/core/enums/http-status";
import { ErrorNames } from "../../src/core/enums/error-names";
import { PostInputModel } from "../../src/core/posts/dto/post-input-dto";

describe("Post body validation tests", () => {
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

  test("No body error; POST /posts", async () => {
    await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({})
      .expect(HttpStatus.BadRequest);
  });

  test("Title not exist error; POST /posts", async () => {
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validPostBody,
        title: undefined,
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.TITLE_MISSING_ERROR,
      field: "title",
    });
  });

  test("Short description length error; POST /posts", async () => {
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validPostBody,
        shortDescription: "toooloooooooooooooooongsitttttteeeeeeeee-rururururururururururururururururururururururururuqwerqwerqwer",
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.DESCRIPTION_LENGTH_ERROR,
      field: "shortDescription",
    });
  });

  test("Content type error; POST /posts", async () => {
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validPostBody,
        content: true,
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.CONTENT_TYPE_ERROR,
      field: "content",
    });
  });

  test("Blog id missing error; POST /posts", async () => {
    const response = await request(app)
      .post(EndpointList.POSTS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validPostBody,
        blogId: "",
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.BLOGID_MISSING_ERROR,
      field: "blogId",
    });
  });
});
