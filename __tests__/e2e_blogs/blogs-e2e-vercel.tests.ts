import axios, { AxiosResponse } from "axios";
import { BlogInputModel } from "../../src/blogs/BLL/dto/blog-input-dto";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
//@ts-ignore
import { getBasicAuthToken } from "../utils/get-basic-auth-token";

const BASE_URL = "https://blogger-platform-be.vercel.app";
const authToken: string = getBasicAuthToken();

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
    // { data: inValidBlogData, exp_1: HttpStatus.BadRequest, exp_2: HttpStatus.BadRequest },
  ])("should correct response; POST /blogs", async ({ data, exp_1, exp_2 }) => {
    const postResponse: AxiosResponse = await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      data,
      { headers: { Authorization: authToken } }
    );
    expect(postResponse.status).toBe(exp_1);

    const blogId = postResponse.data.id;
    const getResponse: AxiosResponse = await axios.get(
      BASE_URL + EndpointList.BLOGS_PATH + "/" + blogId,
      {
        headers: { Authorization: authToken }
      }
    );
    expect(getResponse.status).toBe(exp_2);
  });

  test("should not create unauthorized blog; POST /blogs", async () => {
    const newBlog: BlogInputModel = {
      ...validBlogData,
      name: "Test unauthorized",
    };

    try {
      await axios.post(
        BASE_URL + EndpointList.BLOGS_PATH,
        newBlog
      );
    } catch (error: any) {
      expect(error.response.status).toBe(HttpStatus.Unauthorized);
    }
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

    // Create test blogs
    await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      { ...newBlog1 },
      { headers: { Authorization: authToken } }
    );
    await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      { ...newBlog2 },
      { headers: { Authorization: authToken } }
    );
    await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      { ...newBlog3 },
      { headers: { Authorization: authToken } }
    );

    const blogListResponse: AxiosResponse = await axios.get(
      BASE_URL + EndpointList.BLOGS_PATH
    );

    expect(blogListResponse.status).toBe(HttpStatus.Ok);
    expect(blogListResponse.data.items).toBeInstanceOf(Array);
    expect(blogListResponse.data.items.length).toBeGreaterThanOrEqual(3);
  });

  test("should return blog by id; GET /blogs/:id", async () => {
    const newBlog1: BlogInputModel = {
      ...validBlogData,
    };

    const createResponse: AxiosResponse = await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      { ...newBlog1 },
      { headers: { Authorization: authToken } }
    );
    expect(createResponse.status).toBe(HttpStatus.Created);

    const getResponse: AxiosResponse = await axios.get(
      BASE_URL + EndpointList.BLOGS_PATH + "/" + createResponse.data.id
    );
    expect(getResponse.status).toBe(HttpStatus.Ok);
    expect(getResponse.data).toEqual(createResponse.data);
  });

  test("should update blog by id; PUT /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...validBlogData,
    };
    const updatedValidBlog: BlogInputModel = {
      ...newBlog,
      name: "Test Blog 2",
    };

    const createResponse: AxiosResponse = await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      { ...newBlog },
      { headers: { Authorization: authToken } }
    );
    expect(createResponse.status).toBe(HttpStatus.Created);

    const putResponse: AxiosResponse = await axios.put(
      BASE_URL + EndpointList.BLOGS_PATH + "/" + createResponse.data.id,
      { ...updatedValidBlog },
      { headers: { Authorization: authToken } }
    );
    expect(putResponse.status).toBe(HttpStatus.NoContent);

    const getResponse: AxiosResponse = await axios.get(
      BASE_URL + EndpointList.BLOGS_PATH + "/" + createResponse.data.id
    );
    expect(getResponse.status).toBe(HttpStatus.Ok);
    expect(getResponse.data.name).toEqual(updatedValidBlog.name);
  });

  test("should delete blog by id; DELETE /blogs/:id", async () => {
    const newBlog: BlogInputModel = {
      ...validBlogData,
    };

    const createResponse: AxiosResponse = await axios.post(
      BASE_URL + EndpointList.BLOGS_PATH,
      { ...newBlog },
      { headers: { Authorization: authToken } }
    );
    expect(createResponse.status).toBe(HttpStatus.Created);

    const deleteResponse: AxiosResponse = await axios.delete(
      BASE_URL + EndpointList.BLOGS_PATH + "/" + createResponse.data.id,
      { headers: { Authorization: authToken } }
    );
    expect(deleteResponse.status).toBe(HttpStatus.NoContent);

    try {
      await axios.get(
        BASE_URL + EndpointList.BLOGS_PATH + "/" + createResponse.data.id
      );
    } catch (error: any) {
      expect(error.response.status).toBe(HttpStatus.NotFound);
    }
  });
});