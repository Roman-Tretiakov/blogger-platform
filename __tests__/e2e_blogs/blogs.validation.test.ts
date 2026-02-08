import express from "express";
import request from "supertest";
import { setupApp } from "../../src/setup-app";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { HttpStatus } from "../../src/core/enums/http-status";
import { ErrorNames } from "../../src/core/enums/error-names";
import { BlogInputModel } from "../../src/blogs/BLL/dto/blog-input-dto";
import { blogsService } from "../../src/blogs/BLL/blogs.service";
import { client, closeDBConnection } from "../../src/db/mongo.db";

describe("Blog body validation tests", () => {
  const app = express();
  setupApp(app);

  const username = "admin";
  const password = "qwerty";
  const authString = `${username}:${password}`;
  const authValue: string = `Basic ${Buffer.from(authString).toString("base64")}`;

  const validBlogBody: BlogInputModel = {
    name: "Blog name",
    description: "Test blog",
    websiteUrl: "https://example.com",
  };

  beforeEach(async () => {
    await blogsService.clear();
  });

  afterAll(async () => {
    try {
      await closeDBConnection(client);
    } catch (error) {
      console.error("Error closing DB connection:", error);
      // Можно не бросать ошибку дальше, чтобы не влиять на результат тестов
    }
  });

  test("No body error; POST /blogs", async () => {
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authValue)
      .send({})
      .expect(HttpStatus.BadRequest);
  });

  test("Name not exist error; POST /blogs", async () => {
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validBlogBody,
        name: undefined,
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.NAME_MISSING_ERROR,
      field: "name",
    });
  });

  test("Website name length error; POST /blogs", async () => {
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validBlogBody,
        websiteUrl: "http://www.toooloooooooooooooooongsitttttteeeeeeeee-rururururururururururururururururururururururururu.com",
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.WEBSITEURL_LENGTH_ERROR,
      field: "websiteUrl",
    });
  });

  test("Description types error; POST /blogs", async () => {
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validBlogBody,
        description: true,
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.DESCRIPTION_TYPE_ERROR,
      field: "description",
    });
  });

  test("Website format error; POST /blogs", async () => {
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authValue)
      .send({
        ...validBlogBody,
        websiteUrl: "http:/invalid-url",
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.WEBSITEURL_FORMAT_ERROR,
      field: "websiteUrl",
    });
  });

  test("Id format error; POST /blogs", async () => {
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH + "/id13")
      .set("Authorization", authValue)
      .send({
        ...validBlogBody,
        websiteUrl: "http:/invalid-url",
      })
      .expect(HttpStatus.BadRequest);
    expect(response.body.errorsMessages).toContain({
      message: ErrorNames.ID_FORMAT_ERROR,
      field: "id",
    });
  });
});
