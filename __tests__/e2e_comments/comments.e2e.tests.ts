import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { beforeEach, describe } from "node:test";
import {
  client,
  closeDBConnection,
  commentsCollection,
  runDB,
} from "../../src/db/mongo.db";
import { usersService } from "../../src/users/BLL/users.service";
import { ObjectId } from "mongodb";
import { commentsRepository } from "../../src/comments/repositories/comments.repository";
import { postsRepository } from "../../src/posts/repositories/posts.repository";
import { blogsRepository } from "../../src/blogs/repositories/blogs.repository";

let app: any;
let testUserLogin = "testuser";
let testUserEmail = "test@example.com";
let testUserPassword = "password123";
let accessToken: string;
let testUserId: string;
let testBlogId: string;
let testPostId: string;
let testCommentId: string | null;

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);

  // Создаем тестового пользователя
  testUserId = await usersService.create({
    login: testUserLogin,
    email: testUserEmail,
    password: testUserPassword,
  });

  // получаем токен для тестового пользователя
  const response = await request(app)
    .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
    .send({
      loginOrEmail: testUserLogin,
      password: testUserPassword,
    });
  accessToken = response.body.accessToken;
});

beforeEach(async () => {
  // Очищаем коллекцию пользователей
  await commentsRepository.clear();
  await postsRepository.clear();
  await blogsRepository.clear();


  // Создаем тестовый блог
  testBlogId = await blogsRepository.create({
    name: "Test Blog",
    description: "Test Blog Description",
    websiteUrl: "https://testblog.com",
    createdAt: new Date().toISOString(),
    isMembership: false,
  });

  // Создаем тестовый пост
  testPostId = await postsRepository.create({
    title: "Test Post",
    shortDescription: "Test Post Description",
    content: "Test Post Content",
    blogId: testBlogId,
    blogName: "Test Blog",
    createdAt: new Date().toISOString(),
  });

  // Создаем тестовый комментарий
  testCommentId = await commentsRepository
    .create({
      content: "Original test comment content with more than 20 characters",
      commentatorInfo: {
        userId: testUserId,
        userLogin: testUserLogin,
      },
      postId: testPostId,
      createdAt: new Date().toISOString(),
    })
    .then();
});

afterAll(async () => {
  try {
    await closeDBConnection(client);
  } catch (error) {
    console.error("Error closing DB connection:", error);
    // Можно не бросать ошибку дальше, чтобы не влиять на результат тестов
  }
});

describe("PUT /api/comments/{commentId}", () => {
  const validUpdateData = {
    content: "Updated comment content with more than 20 characters for testing",
  };

  describe("Positive scenarios", () => {
    test("Should update own comment with valid data", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validUpdateData);

      expect(response.status).toBe(204);
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without authorization", async () => {
        const response = await request(app)
          .put(`/api/comments/${testCommentId}`)
          .send(validUpdateData);

        expect(response.status).toBe(401);
      });

      test("Should return 403 when trying to update another user comment", async () => {
        // Создаем другого пользователя
        await usersService.create({
          login: "new" + testUserLogin,
          email: "new" + testUserEmail,
          password: testUserPassword,
        });

        // получаем токен для тестового пользователя
        const loginResponse = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({
            loginOrEmail: "new" + testUserLogin,
            password: "new" + testUserPassword,
          });
        const newAccessToken = loginResponse.body.accessToken;

        const response = await request(app)
          .put(`/api/comments/${testCommentId}`)
          .set("Authorization", `Bearer ${newAccessToken}`)
          .send(validUpdateData);

        expect(response.status).toBe(403);
      });

      test("Should return 400 for invalid content length (less than 20)", async () => {
        const response = await request(app)
          .put(`/api/comments/${testCommentId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            content: "Too short",
          });

        expect(response.status).toBe(400);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: "content",
              message: expect.stringContaining("20"),
            }),
          ]),
        );
      });

      test("Should return 400 for invalid content length (more than 300)", async () => {
        const longContent = "a".repeat(301);

        const response = await request(app)
          .put(`/api/comments/${testCommentId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            content: longContent,
          });

        expect(response.status).toBe(400);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: "content",
              message: expect.stringContaining("300"),
            }),
          ]),
        );
      });

      test("Should return 400 for missing content field", async () => {
        const response = await request(app)
          .put(`/api/comments/${testCommentId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});

        expect(response.status).toBe(400);
      });

      test("Should return 404 for non-existent comment", async () => {
        const nonExistentId = new ObjectId().toString();

        const response = await request(app)
          .put(`/api/comments/${nonExistentId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validUpdateData);

        expect(response.status).toBe(404);
      });

      test("Should return 400 for invalid commentId format", async () => {
        const response = await request(app)
          .put("/api/comments/invalid-id-format")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validUpdateData);

        expect(response.status).toBe(400);
      });
    });
  });

  describe("DELETE /api/comments/{commentId}", () => {
    describe("Positive scenarios", () => {
      test("Should delete own comment", async () => {
        const response = await request(app)
          .delete(`/api/comments/${testCommentId}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(204);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without authorization", async () => {
        const response = await request(app).delete(
          `/api/comments/${testCommentId}`,
        );

        expect(response.status).toBe(401);
      });

      test("Should return 403 when trying to delete another user comment", async () => {
        // Создаем другого пользователя
        await usersService.create({
          login: "new" + testUserLogin,
          email: "new" + testUserEmail,
          password: testUserPassword,
        });

        // получаем токен для тестового пользователя
        const loginResponse = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({
            loginOrEmail: "new" + testUserLogin,
            password: "new" + testUserPassword,
          });
        const newAccessToken = loginResponse.body.accessToken;

        const response = await request(app)
          .delete(`/api/comments/${testCommentId}`)
          .set("Authorization", `Bearer ${newAccessToken}`);

        expect(response.status).toBe(403);
      });

      test("Should return 404 for non-existent comment", async () => {
        const nonExistentId = new ObjectId().toString();

        const response = await request(app)
          .delete(`/api/comments/${nonExistentId}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(404);
      });

      test("Should return 400 for invalid commentId format", async () => {
        const response = await request(app)
          .delete("/api/comments/invalid-id-format")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(400);
      });
    });
  });

  describe("GET /api/comments/{id}", () => {
    describe("Positive scenarios", () => {
      test("Should return comment by id without authorization", async () => {
        const response = await request(app).get(
          `/api/comments/${testCommentId}`,
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          id: testCommentId,
          content: expect.any(String),
          commentatorInfo: {
            userId: testUserId,
            userLogin: testUserLogin,
          },
          createdAt: expect.any(String),
        });
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 404 for non-existent comment", async () => {
        const nonExistentId = new ObjectId().toString();

        const response = await request(app).get(
          `/api/comments/${nonExistentId}`,
        );

        expect(response.status).toBe(404);
      });

      test("Should return 400 for invalid commentId format", async () => {
        const response = await request(app).get(
          "/api/comments/invalid-id-format",
        );
        expect(response.status).toBe(400);
      });
    });
  });
});

// ========== POSTS COMMENTS TESTS ==========
describe("GET /api/posts/{postId}/comments", () => {
  beforeEach(async () => {
    // Создаем несколько комментариев для теста пагинации
    for (let i = 1; i <= 15; i++) {
      await commentsRepository.create({
        content: `Test comment ${i} with enough characters for validation`,
        commentatorInfo: {
          userId: testUserId,
          userLogin: testUserLogin,
        },
        postId: testPostId,
        createdAt: new Date(Date.now() - i * 1000).toISOString(), // Разное время для сортировки
      });
    }
  });

  describe("Positive scenarios", () => {
    test("Should return comments with default pagination", async () => {
      const response = await request(app).get(
        `/api/posts/${testPostId}/comments`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pagesCount");
      expect(response.body).toHaveProperty("page", 1);
      expect(response.body).toHaveProperty("pageSize", 10);
      expect(response.body).toHaveProperty("totalCount");
      expect(response.body.items).toHaveLength(10); // pageSize по умолчанию
    });

    test("Should return page 2 with custom pageSize", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ pageNumber: 2, pageSize: 5 });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(5);
      expect(response.body.items).toHaveLength(5);
    });

    test("Should sort comments by createdAt desc by default", async () => {
      const response = await request(app).get(
        `/api/posts/${testPostId}/comments`,
      );

      const items = response.body.items;
      // Проверяем сортировку по убыванию (новые первыми)
      for (let i = 0; i < items.length - 1; i++) {
        const currentDate = new Date(items[i].createdAt).getTime();
        const nextDate = new Date(items[i + 1].createdAt).getTime();
        expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      }
    });

    test("Should sort comments by createdAt asc when specified", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ sortDirection: "asc" });

      const items = response.body.items;
      // Проверяем сортировку по возрастанию (старые первыми)
      for (let i = 0; i < items.length - 1; i++) {
        const currentDate = new Date(items[i].createdAt).getTime();
        const nextDate = new Date(items[i + 1].createdAt).getTime();
        expect(currentDate).toBeLessThanOrEqual(nextDate);
      }
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 404 for non-existent post", async () => {
      const nonExistentId = new ObjectId().toString();

      const response = await request(app).get(
        `/api/posts/${nonExistentId}/comments`,
      );

      expect(response.status).toBe(404);
    });

    test("Should return 400 for invalid postId format", async () => {
      const response = await request(app).get(
        "/api/posts/invalid-id-format/comments",
      );

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid pageNumber (less than 1)", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ pageNumber: 0 });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid pageSize (less than 1)", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ pageSize: 0 });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid sortBy value", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ sortBy: "invalidField" });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid sortDirection value", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ sortDirection: "invalid" });

      expect(response.status).toBe(400);
    });
  });
});

describe("POST /api/posts/{postId}/comments", () => {
  const validCommentData = {
    content: "New comment content with more than 20 characters for testing",
  };

  describe("Positive scenarios", () => {
    test("Should create new comment for post with valid data", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validCommentData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: validCommentData.content,
        commentatorInfo: {
          userId: testUserId,
          userLogin: testUserLogin,
        },
        createdAt: expect.any(String),
      });

      // Проверяем, что комментарий создан в БД
      const createdComment = await commentsCollection.findOne({
        content: validCommentData.content,
      });
      expect(createdComment).toBeDefined();
      expect(createdComment?.postId).toBe(testPostId);
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 401 without authorization", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .send(validCommentData);

      expect(response.status).toBe(401);
    });

    test("Should return 404 for non-existent post", async () => {
      const nonExistentId = new ObjectId().toString();

      const response = await request(app)
        .post(`/api/posts/${nonExistentId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validCommentData);

      expect(response.status).toBe(404);
    });

    test("Should return 400 for invalid content length (less than 20)", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Too short",
        });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid content length (more than 300)", async () => {
      const longContent = "a".repeat(301);

      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: longContent,
        });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for missing content field", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid postId format", async () => {
      const response = await request(app)
        .post("/api/posts/invalid-id-format/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validCommentData);

      expect(response.status).toBe(400);
    });
  });
});
