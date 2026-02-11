import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { BlogInputModel } from "../../src/blogs/BLL/dto/blog-input-dto";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
//@ts-ignore
import { getBasicAuthToken } from "../utils/get-basic-auth-token";
import { client, closeDBConnection, runDB } from "../../src/db/mongo.db";
//@ts-ignore
import { blogsService } from "../../src/blogs/BLL/blogs.service";

let app: any;
const authToken: string = getBasicAuthToken();

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);
});

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

// TESTS:
describe("Blogs API tests", () => {
  const validBlogData: BlogInputModel = {
    name: "Test Blog",
    description: "Test description",
    websiteUrl: "https://samurai.io",
  };

  const inValidBlogData: any = {
    name: 1,
    description: "Test description",
    websiteUrl: "https://samurai.io",
  };

  test.each([
    { data: validBlogData, exp_1: HttpStatus.Created, exp_2: HttpStatus.Ok },
    // { data: inValidBlogData, exp: HttpStatus.BadRequest, exp_2: HttpStatus.BadRequest },
  ])("should correct response; POST /blogs", async ({ data, exp_1, exp_2 }) => {
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send(data)
      .expect(exp_1);

    const result = await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(exp_2);
  });

  test("should not create unauthorized blog; POST /blogs", async () => {
    const newBlog: BlogInputModel = {
      ...validBlogData,
      name: "Test unauthorized",
    };
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .send(newBlog)
      .expect(HttpStatus.Unauthorized);
  });

  test("should return blogs list; GET /blogs", async () => {
    const newBlog1: BlogInputModel = {
      ...validBlogData,
    };
    const newBlog2: BlogInputModel = {
      ...validBlogData,
      name: "Test Blog 2",
    };
    const newBlog3: BlogInputModel = {
      ...validBlogData,
      name: "Test Blog 3",
    };

    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog1 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog2 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog3 })
      .expect(HttpStatus.Created);

    const blogListResponse = await request(app)
      .get(EndpointList.BLOGS_PATH)
      .expect(HttpStatus.Ok);

    expect(blogListResponse.body).toBeInstanceOf(Array);
    expect(blogListResponse.body.length).toBeGreaterThanOrEqual(3);
  });

  test("should return blog by id; GET /blogs/:id", async () => {
    const newBlog1: BlogInputModel = {
      ...validBlogData,
    };
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog1 })
      .expect(HttpStatus.Created);

    const getBlog = await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .expect(HttpStatus.Ok);
    expect(getBlog.body).toEqual(response.body);
  });

  test("should update blog by id; PUT /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...validBlogData,
    };
    const updatedValidBlog: BlogInputModel = {
      ...newBlog,
      name: "Test Blog 2",
    };

    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog })
      .expect(HttpStatus.Created);
    await request(app)
      .put(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .send({ ...updatedValidBlog })
      .expect(HttpStatus.NoContent);
    const result = await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.Ok);
    expect(result.body.name).toEqual(updatedValidBlog.name);
  });

  test("should delete blog by id; DELETE /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...validBlogData,
    };
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("Authorization", authToken)
      .expect(HttpStatus.NotFound);
  });
});

describe("Sorting and pagination Blogs tests", () => {
  //test suits:
  const blog1: BlogInputModel = {
    name: "Test blog",
    description: "about",
    websiteUrl: "http://blog.com",
  }

  const searchNameTerms: any[] = [
    { value: "tom", exp: true },
    { value: "test" },
    { value: "blog1" },
    { value: " " },
  ];
});
