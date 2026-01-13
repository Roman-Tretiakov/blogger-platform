import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { BlogInputModel } from "../../src/core/blogs/dto/blog-input-dto";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { beforeEach } from "node:test";

describe("Blogs API tests", () => {
  const app = express();
  setupApp(app);

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const authString = `${username}:${password}`;
  const authValue: string = `Basic ${Buffer.from(authString).toString("base64")}`;

  const createdBlog: BlogInputModel = {
    name: "Test Blog",
    description: "Test description",
    websiteUrl: "https://samurai.io",
  };

  beforeEach(async () => {
    const res = await request(app).delete(
      "/api/testing" + EndpointList.TEST_DELETE_ALL,
    );
    expect(res.status).toBe(HttpStatus.NoContent);
    expect(res.body).toEqual({});
  });

  test("should create valid blog; POST /blogs", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
    };
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
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
      .set("authorization", authValue)
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
      .set("authorization", authValue)
      .send({ ...newBlog1 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
      .send({ ...newBlog2 })
      .expect(HttpStatus.Created);
    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
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
    const newBlog2: BlogInputModel = {
      ...createdBlog,
      name: "Test Blog 2",
    };

    await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
      .send({ ...newBlog1 })
      .expect(HttpStatus.Created);
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
      .send({ ...newBlog2 })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .expect(HttpStatus.Ok);
    expect(getResponse.body).toEqual({
      ...response.body,
    });

    await request(app)
      .get(EndpointList.BLOGS_PATH + "/" + "10")
      .expect(HttpStatus.NotFound);
  });

  test("should update blog by id; PUT /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
    };
    const updatedValidBlog: BlogInputModel = {
      ...newBlog,
      name: "Test Blog 2",
    };
    const updatedInvalidBlog: any = {
      ...newBlog,
      name: 1,
    };

    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
      .send({ ...newBlog })
      .expect(HttpStatus.Created);

    await request(app)
      .put(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("authorization", authValue)
      .send({ ...updatedValidBlog })
      .expect(HttpStatus.NoContent);
    await request(app)
      .put(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("authorization", authValue)
      .send({ ...updatedInvalidBlog })
      .expect(HttpStatus.BadRequest);
    await request(app)
      .put(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .send({ ...updatedValidBlog })
      .expect(HttpStatus.Unauthorized);
    await request(app)
      .put(EndpointList.BLOGS_PATH + "/" + "5")
      .set("authorization", authValue)
      .send({ ...updatedValidBlog })
      .expect(HttpStatus.NotFound);

  });

  test("should delete blog by id; DELETE /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...createdBlog,
    };
    const response = await request(app)
      .post(EndpointList.BLOGS_PATH)
      .set("authorization", authValue)
      .send({ ...newBlog })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .set("authorization", authValue)
      .expect(HttpStatus.NoContent);
    await request(app)
      .delete(EndpointList.BLOGS_PATH + "/" + response.body.id)
      .expect(HttpStatus.Unauthorized);
    await request(app)
      .delete(EndpointList.BLOGS_PATH + "/" + "2")
      .set("authorization", authValue)
      .expect(HttpStatus.NotFound);
  });
});
