import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { BlogInputModel } from "../../src/blogs/dto/blog-input-dto";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { beforeEach } from "node:test";
//@ts-ignore
import { getBasicAuthToken } from "../utils/get-basic-auth-token";
import { runDB } from "../../src/db/mongo.db";
//@ts-ignore
import { clearDB } from "../utils/clear-db";

describe("Blogs API tests", () => {
  const app = express();
  setupApp(app);

  const authToken: string = getBasicAuthToken();

  const createdBlog: BlogInputModel = {
    name: "Test Blog",
    description: "Test description",
    websiteUrl: "https://samurai.io",
  };

  beforeAll(async () => {
    await runDB(
      "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
    );
  });

  beforeEach(async () => {
    await clearDB(app);
  });

  test("should create valid blog; POST /blogs", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
    };
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send(newBlog)
      .expect(HttpStatus.Created);
  });

  test("should not create invalid blog; POST /blogs", async () => {
    const newBlog: any = {
      ...createdBlog,
      name: 1,
    };
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send(newBlog)
      .expect(HttpStatus.BadRequest);
  });

  test("should not create unauthorized blog; POST /blogs", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
      name: "Test unauthorized",
    };
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .send(newBlog)
      .expect(HttpStatus.Unauthorized);
  });

  test("should return blogs list; GET /blogs", async () => {
    const newBlog1: BlogInputModel = {
      ...createdBlog,
    };
    const newBlog2: BlogInputModel = {
      ...createdBlog,
      name: "Test Blog 2",
    };
    const newBlog3: BlogInputModel = {
      ...createdBlog,
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
    expect(blogListResponse.body.length).toEqual(3);
  });

  test("should return blog by id; GET /blogs/:id", async () => {
    const newBlog1: BlogInputModel = {
      ...createdBlog,
    };
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog1 })
      .expect(HttpStatus.Created);

    const getBlog = await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body._id)
      .expect(HttpStatus.Ok);
    expect(getBlog.body).toEqual({
      ...response.body,
    });
  });

  test("should update blog by id; PUT /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
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
      .put(EndpointList.BLOGS_PATH + "/" + response.body._id)
      .set("Authorization", authToken)
      .send({ ...updatedValidBlog })
      .expect(HttpStatus.NoContent);
    const result = await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body._id)
      .set("Authorization", authToken)
      .expect(HttpStatus.Ok);
    expect(result.body.name).toEqual(updatedValidBlog.name);
  });

  test("should delete blog by id; DELETE /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
    };
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("Authorization", authToken)
      .send({ ...newBlog })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(EndpointList.BLOGS_PATH + "/" + response.body._id)
      .set("Authorization", authToken)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body._id)
      .set("Authorization", authToken)
      .expect(HttpStatus.NotFound);
  });
});
