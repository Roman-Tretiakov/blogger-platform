import request from "supertest";
import express from "express";
import { setupApp } from "../../../src/setup-app";
import { EndpointList } from "../../../src/core/constants/endpoint-list";
import { closeDBConnection, runDB } from "../../../src/db/mongo.db";
import { UsersService } from "../../../src/users/BLL/users.service";
import { ObjectId } from "mongodb";
import { CommentsRepository } from "../../../src/comments/repositories/comments.repository";
import { PostsRepository } from "../../../src/posts/repositories/posts.repository";
import { BlogsRepository } from "../../../src/blogs/repositories/blogs.repository";
import { iocContainer } from "../../../src/composition-root";
import { CommentModel } from "../../../src/comments/repositories/schemas/comment.schema";
import { CommentReactionRepository } from "../../../src/commentReaction/repositories/comment-reaction.repository";
import { UsersRepository } from "../../../src/users/repositories/users.repository";
import { AuthDevicesRepository } from "../../../src/securityDevices/repositories/authDevices.repository";

let app: any;
let testUserLogin = "testuser";
let testUserEmail = "test@example.com";
let testUserPassword = "password123";
let accessToken: string;
let testUserId: string;
let testBlogId: string;
let testPostId: string;
let testCommentId: string | null;

const usersService = iocContainer.resolve(UsersService);
const usersRepository = iocContainer.resolve(UsersRepository);
const commentsRepository = iocContainer.resolve(CommentsRepository);
const postsRepository = iocContainer.resolve(PostsRepository);
const blogsRepository = iocContainer.resolve(BlogsRepository);
// Репозиторий для очистки реакций между тестами
const commentReactionRepository = iocContainer.resolve(
  CommentReactionRepository,
);
const authDevicesRepository = iocContainer.resolve(AuthDevicesRepository);

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);

  testUserId = await usersService.create({
    login: testUserLogin,
    email: testUserEmail,
    password: testUserPassword,
  });

  const response = await request(app)
    .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
    .send({
      loginOrEmail: testUserLogin,
      password: testUserPassword,
    });
  accessToken = response.body.accessToken;
});

beforeEach(async () => {
  await commentsRepository.clear();
  await postsRepository.clear();
  await blogsRepository.clear();
  // Реакции живут отдельно от комментариев — чистим независимо
  await commentReactionRepository.clear();

  testBlogId = await blogsRepository.create({
    name: "Test Blog",
    description: "Test Blog Description",
    websiteUrl: "https://testblog.com",
    createdAt: new Date().toISOString(),
    isMembership: false,
  });

  testPostId = await postsRepository.create({
    title: "Test Post",
    shortDescription: "Test Post Description",
    content: "Test Post Content",
    blogId: testBlogId,
    blogName: "Test Blog",
    createdAt: new Date().toISOString(),
  });

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
    .then((res) => res.data);
});

afterAll(async () => {
  await commentsRepository.clear();
  await postsRepository.clear();
  await blogsRepository.clear();
  // Реакции живут отдельно от комментариев — чистим независимо
  await commentReactionRepository.clear();
  await usersRepository.clear();
  await authDevicesRepository.clear();

  try {
    await closeDBConnection();
  } catch (error) {
    console.error("Error closing DB connection:", error);
  }
});

// ========== PUT /api/comments/{commentId} ==========
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
  });

  describe("Negative scenarios", () => {
    test("Should return 401 without authorization", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .send(validUpdateData);

      expect(response.status).toBe(401);
    });

    test("Should return 403 when trying to update another user comment", async () => {
      await usersService.create({
        login: "new" + testUserLogin,
        email: "new" + testUserEmail,
        password: testUserPassword,
      });

      const loginResponse = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: "new" + testUserLogin,
          password: testUserPassword,
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
        .send({ content: "Too short" });

      expect(response.status).toBe(400);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "content",
            message: expect.stringContaining(
              "Content must be within acceptable values",
            ),
          }),
        ]),
      );
    });

    test("Should return 400 for invalid content length (more than 300)", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "a".repeat(301) });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for missing content field", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test("Should return 404 for non-existent comment", async () => {
      const response = await request(app)
        .put(`/api/comments/${new ObjectId().toString()}`)
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

// ========== DELETE /api/comments/{commentId} ==========
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
      await usersService.create({
        login: "newone" + testUserLogin,
        email: "newone" + testUserEmail,
        password: testUserPassword,
      });

      const loginResponse = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: "newone" + testUserLogin,
          password: testUserPassword,
        });

      const response = await request(app)
        .delete(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

      expect(response.status).toBe(403);
    });

    test("Should return 404 for non-existent comment", async () => {
      const response = await request(app)
        .delete(`/api/comments/${new ObjectId().toString()}`)
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

// ========== GET /api/comments/{id} ==========
describe("GET /api/comments/{id}", () => {
  describe("Positive scenarios", () => {
    // Гость (неавторизованный) получает myStatus = None
    test("Should return comment with likesInfo for anonymous user", async () => {
      const response = await request(app).get(`/api/comments/${testCommentId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: testCommentId,
        content: expect.any(String),
        commentatorInfo: {
          userId: testUserId,
          userLogin: testUserLogin,
        },
        createdAt: expect.any(String),
        // likesInfo обязателен согласно swagger
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None",
        },
      });
    });

    // Авторизованный пользователь получает свой статус реакции
    test("Should return myStatus=Like after user liked the comment", async () => {
      // Ставим лайк
      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      const response = await request(app)
        .get(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.likesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: "Like",
      });
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 404 for non-existent comment", async () => {
      const response = await request(app).get(
        `/api/comments/${new ObjectId().toString()}`,
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

// ========== PUT /api/comments/{commentId}/like-status ==========
describe("PUT /api/comments/{commentId}/like-status", () => {
  // Каждый тест стартует с чистыми реакциями (см. beforeEach выше)

  describe("Positive scenarios", () => {
    test("Should set Like status and increment likesCount", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      expect(response.status).toBe(204);

      // Проверяем счётчик через GET
      const comment = await request(app).get(`/api/comments/${testCommentId}`);
      expect(comment.body.likesInfo.likesCount).toBe(1);
      expect(comment.body.likesInfo.dislikesCount).toBe(0);
    });

    test("Should set Dislike status and increment dislikesCount", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Dislike" });

      expect(response.status).toBe(204);

      const comment = await request(app).get(`/api/comments/${testCommentId}`);
      expect(comment.body.likesInfo.likesCount).toBe(0);
      expect(comment.body.likesInfo.dislikesCount).toBe(1);
    });

    test("Should set None status (unlike) and reset count back to 0", async () => {
      // Сначала ставим лайк
      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      // Затем убираем его через None
      const response = await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "None" });

      expect(response.status).toBe(204);

      const comment = await request(app).get(`/api/comments/${testCommentId}`);
      expect(comment.body.likesInfo.likesCount).toBe(0);
      expect(comment.body.likesInfo.myStatus).toBe("None");
    });

    test("Should switch from Like to Dislike correctly (counts update atomically)", async () => {
      // Like
      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      // Switch to Dislike
      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Dislike" });

      const comment = await request(app).get(`/api/comments/${testCommentId}`);
      // likes должен вернуться в 0, dislikes стать 1
      expect(comment.body.likesInfo.likesCount).toBe(0);
      expect(comment.body.likesInfo.dislikesCount).toBe(1);
    });

    test("Sending same status twice should be idempotent (no double-counting)", async () => {
      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      const comment = await request(app).get(`/api/comments/${testCommentId}`);
      // Второй лайк от того же юзера не должен увеличить счётчик
      expect(comment.body.likesInfo.likesCount).toBe(1);
    });

    test("Two different users liking the same comment — both counted", async () => {
      // Создаём второго пользователя
      const secondUserId = await usersService.create({
        login: "second",
        email: "second@example.com",
        password: "password123",
      });
      const {
        body: { accessToken: secondToken },
      } = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({ loginOrEmail: "second", password: "password123" });

      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${secondToken}`)
        .send({ likeStatus: "Like" });

      const comment = await request(app).get(`/api/comments/${testCommentId}`);
      expect(comment.body.likesInfo.likesCount).toBe(2);
    });

    test("myStatus should differ per user (user1=Like, user2=Dislike)", async () => {
      const secondUserId = await usersService.create({
        login: "secondone",
        email: "secondone@example.com",
        password: "password123",
      });
      const {
        body: { accessToken: secondToken },
      } = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({ loginOrEmail: "secondone", password: "password123" });

      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${secondToken}`)
        .send({ likeStatus: "Dislike" });

      // Проверяем myStatus для каждого пользователя отдельно
      const forUser1 = await request(app)
        .get(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(forUser1.body.likesInfo.myStatus).toBe("Like");

      const forUser2 = await request(app)
        .get(`/api/comments/${testCommentId}`)
        .set("Authorization", `Bearer ${secondToken}`);
      expect(forUser2.body.likesInfo.myStatus).toBe("Dislike");
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 401 without authorization", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .send({ likeStatus: "Like" });

      expect(response.status).toBe(401);
    });

    test("Should return 404 for non-existent comment", async () => {
      const response = await request(app)
        .put(`/api/comments/${new ObjectId().toString()}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      expect(response.status).toBe(404);
    });

    test("Should return 400 for invalid commentId format", async () => {
      const response = await request(app)
        .put("/api/comments/invalid-id/like-status")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for invalid likeStatus value", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        // Значение не из enum None | Like | Dislike
        .send({ likeStatus: "InvalidStatus" });

      expect(response.status).toBe(400);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "likeStatus" }),
        ]),
      );
    });

    test("Should return 400 when likeStatus field is missing", async () => {
      const response = await request(app)
        .put(`/api/comments/${testCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});

// ========== GET /api/posts/{postId}/comments ==========
describe("GET /api/posts/{postId}/comments", () => {
  beforeEach(async () => {
    for (let i = 1; i <= 15; i++) {
      await commentsRepository.create({
        content: `Test comment ${i} with enough characters for validation`,
        commentatorInfo: {
          userId: testUserId,
          userLogin: testUserLogin,
        },
        postId: testPostId,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
      });
    }
  });

  describe("Positive scenarios", () => {
    test("Should return comments with default pagination and likesInfo", async () => {
      const response = await request(app).get(
        `/api/posts/${testPostId}/comments`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pagesCount");
      expect(response.body).toHaveProperty("page", 1);
      expect(response.body).toHaveProperty("pageSize", 10);
      expect(response.body).toHaveProperty("totalCount");
      expect(response.body.items).toHaveLength(10);

      // Каждый комментарий должен содержать likesInfo
      response.body.items.forEach((item: any) => {
        expect(item).toHaveProperty("likesInfo");
        expect(item.likesInfo).toMatchObject({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: "None", // анонимный запрос — всегда None
        });
      });
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
      for (let i = 0; i < items.length - 1; i++) {
        expect(new Date(items[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(items[i + 1].createdAt).getTime(),
        );
      }
    });

    test("Should sort comments by createdAt asc when specified", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .query({ sortDirection: "asc" });

      const items = response.body.items;
      for (let i = 0; i < items.length - 1; i++) {
        expect(new Date(items[i].createdAt).getTime()).toBeLessThanOrEqual(
          new Date(items[i + 1].createdAt).getTime(),
        );
      }
    });

    // myStatus в списке тоже должен отражать реакцию авторизованного пользователя
    test("Should return myStatus=Like for authenticated user who liked a comment", async () => {
      // Берём первый комментарий из списка
      const listResponse = await request(app).get(
        `/api/posts/${testPostId}/comments`,
      );
      const firstCommentId = listResponse.body.items[0].id;

      await request(app)
        .put(`/api/comments/${firstCommentId}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: "Like" });

      const response = await request(app)
        .get(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`);

      const likedItem = response.body.items.find(
        (item: any) => item.id === firstCommentId,
      );
      expect(likedItem.likesInfo.myStatus).toBe("Like");
      expect(likedItem.likesInfo.likesCount).toBe(1);
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 404 for non-existent post", async () => {
      const response = await request(app).get(
        `/api/posts/${new ObjectId().toString()}/comments`,
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

// ========== POST /api/posts/{postId}/comments ==========
describe("POST /api/posts/{postId}/comments", () => {
  const validCommentData = {
    content: "New comment content with more than 20 characters for testing",
  };

  describe("Positive scenarios", () => {
    test("Should create new comment and return it with likesInfo", async () => {
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
        // Новый комментарий — счётчики нулевые, статус None
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None",
        },
      });

      const createdComment = await CommentModel.findOne({
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
      const response = await request(app)
        .post(`/api/posts/${new ObjectId().toString()}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validCommentData);

      expect(response.status).toBe(404);
    });

    test("Should return 400 for content shorter than 20 chars", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Too short" });

      expect(response.status).toBe(400);
    });

    test("Should return 400 for content longer than 300 chars", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "a".repeat(301) });

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
