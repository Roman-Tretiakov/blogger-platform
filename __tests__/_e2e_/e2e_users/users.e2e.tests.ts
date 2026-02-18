import request from "supertest";
import express from "express";
import { setupApp } from "../../../src/setup-app";
import { HttpStatus } from "../../../src/core/enums/http-status";
import { EndpointList } from "../../../src/core/constants/endpoint-list";
import { beforeEach, describe } from "node:test";
//@ts-ignore
import { getBasicAuthToken } from "../../utils/get-basic-auth-token";
import {
  client,
  closeDBConnection,
  runDB,
  usersCollection,
} from "../../../src/db/mongo.db";
import { usersService } from "../../../src/users/BLL/users.service";
import { UserInputModel } from "../../../src/users/types/inputTypes/user-input-model";
import { ObjectId } from "mongodb";

let app: any;
const authToken: string = getBasicAuthToken();
const testUsers: UserInputModel[] = [
  {
    login: "Dimych",
    email: "dimych@gmail.com",
    password: "password123",
  },
  {
    login: "Natalia",
    email: "kuzyuberdina@gmail.com",
    password: "password456",
  },
  {
    login: "Alex",
    email: "alex@gmail.com",
    password: "password789",
  },
  {
    login: "Dan",
    email: "dan@gmail.com",
    password: "password999",
  },
];

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);
});

beforeEach(async () => {
  await usersService.clear();
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
describe("Users API", () => {
  beforeEach(async () => {
    // Создаем тестовых пользователей
    for (const user of testUsers) {
      await usersService.create(user);
    }
  });

  describe("GET /api/users", () => {
    describe("Authentication", () => {
      test("Should return 401 without authorization", async () => {
        const response = await request(app).get(EndpointList.USERS_PATH);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid credentials", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .set(
            "Authorization",
            `Basic ${Buffer.from("wrong:credentials").toString("base64")}`,
          );

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 200 with valid admin credentials", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
      });
    });

    describe("Pagination and sorting", () => {
      test("Should return default pagination (page 1, size 10)", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("page", 1);
        expect(response.body).toHaveProperty("pageSize", 10);
        expect(response.body).toHaveProperty("pagesCount");
        expect(response.body).toHaveProperty("totalCount", testUsers.length);
        expect(response.body.items).toHaveLength(testUsers.length);
      });

      test("Should return page 2 with size 2", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ pageNumber: 2, pageSize: 2 })
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("page", 2);
        expect(response.body).toHaveProperty("pageSize", 2);
        expect(response.body.items).toHaveLength(2);
      });

      test("Should sort by createdAt desc by default", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .set("Authorization", authToken);

        const items = response.body.items;
        // Проверяем, что последний созданный идет первым
        expect(new Date(items[0].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(items[1].createdAt).getTime(),
        );
      });

      test("Should sort by login asc", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ sortBy: "login", sortDirection: "asc" })
          .set("Authorization", authToken);

        const items = response.body.items;
        expect(items[0].login).toBe("Alex"); // A идет перед D
        expect(items[1].login).toBe("Dan");
      });

      test("Should sort by email desc", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ sortBy: "email", sortDirection: "desc" })
          .set("Authorization", authToken);

        const items = response.body.items;
        // Проверяем сортировку по убыванию email
        expect(items[0].email >= items[1].email).toBeTruthy();
      });
    });

    describe("Search functionality", () => {
      test('Should find users by login containing "D"', async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ searchLoginTerm: "D" })
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
        // Должны найти Dimych и Dan
        expect(response.body.items).toHaveLength(2);
        expect(response.body.items.map((u: any) => u.login)).toEqual(
          expect.arrayContaining(["Dimych", "Dan"]),
        );
      });

      test('Should find users by email containing "K" (case insensitive)', async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ searchEmailTerm: "K" })
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
        // Должны найти kuzyuberdina@gmail.com
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].email).toBe("kuzyuberdina@gmail.com");
      });

      test('Should find users by login "D" AND email "K"', async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({
            searchLoginTerm: "D",
            searchEmailTerm: "K",
          })
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
        // Должен найти Dimych (логин содержит D)
        // и Natalia (email содержит k) - ИЛИ логика!
        expect(response.body.items).toHaveLength(2);
      });

      test("Should return empty array when no matches found", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ searchLoginTerm: "XYZ" })
          .set("Authorization", authToken);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body.items).toHaveLength(0);
      });
    });

    describe("Validation errors", () => {
      test("Should return 400 for invalid pageNumber", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ pageNumber: 0 })
          .set("Authorization", authToken);

        expect(response.status).toBe(400);
      });

      test("Should return 400 for invalid pageSize", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ pageSize: 0 })
          .set("Authorization", authToken);

        expect(response.status).toBe(400);
      });

      test("Should return 400 for invalid sortBy", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ sortBy: "invalidField" })
          .set("Authorization", authToken);

        expect(response.status).toBe(400);
      });

      test("Should return 400 for invalid sortDirection", async () => {
        const response = await request(app)
          .get(EndpointList.USERS_PATH)
          .query({ sortDirection: "invalid" })
          .set("Authorization", authToken);

        expect(response.status).toBe(400);
      });
    });
  });

  describe("POST /api/users", () => {
    const validUserInput = {
      login: "NewUser",
      password: "validPass123",
      email: "newuser@example.com",
    };

    describe("Positive scenarios", () => {
      test("Should create new user with valid data", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send(validUserInput);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.login).toBe(validUserInput.login);
        expect(response.body.email).toBe(validUserInput.email);
        expect(response.body.createdAt).toBeDefined();

        // Проверяем, что пользователь действительно создан
        const userInDb = await usersCollection.findOne({
          email: validUserInput.email,
        });
        expect(userInDb).toBeDefined();
      });
    });

    describe("Negative scenarios - Authentication", () => {
      test("Should return 401 without authorization", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .send(validUserInput);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });

    describe("Negative scenarios - Validation", () => {
      test("Should return 400 for missing required fields", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "test",
            // password missing
            email: "test@example.com",
          });

        expect(response.status).toBe(400);
        expect(response.body.errorsMessages).toContainEqual(
          expect.objectContaining({
            field: "password",
            message: expect.any(String),
          }),
        );
      });

      test("Should return 400 for login too short (<3)", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "ab",
            password: "password123",
            email: "test@example.com",
          });

        expect(response.status).toBe(400);
      });

      test("Should return 400 for login too long (>10)", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "verylongloginname",
            password: "password123",
            email: "test@example.com",
          });

        expect(response.status).toBe(400);
      });

      test("Should return 400 for password too short (<6)", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "testuser",
            password: "123",
            email: "test@example.com",
          });

        expect(response.status).toBe(400);
      });

      test("Should return 400 for password too long (>20)", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "testuser",
            password: "a".repeat(21),
            email: "test@example.com",
          });

        expect(response.status).toBe(400);
      });

      test("Should return 400 for invalid email format", async () => {
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "testuser",
            password: "password123",
            email: "invalid-email",
          });

        expect(response.status).toBe(400);
      });

      test("Should return 400 for duplicate login", async () => {
        // Сначала создаем пользователя
        await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send(validUserInput);

        // Пытаемся создать с тем же логином
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: validUserInput.login,
            password: "differentPass123",
            email: "different@example.com",
          });

        expect(response.status).toBe(400);
        expect(response.body.errorsMessages).toContainEqual(
          expect.objectContaining({
            field: "login",
            message: expect.stringContaining("unique"),
          }),
        );
      });

      test("Should return 400 for duplicate email", async () => {
        // Сначала создаем пользователя
        await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send(validUserInput);

        // Пытаемся создать с той же почтой
        const response = await request(app)
          .post(EndpointList.USERS_PATH)
          .set("Authorization", authToken)
          .send({
            login: "DifferentLogin",
            password: "differentPass123",
            email: validUserInput.email,
          });

        expect(response.status).toBe(400);
        expect(response.body.errorsMessages).toContainEqual(
          expect.objectContaining({
            field: "email",
            message: expect.stringContaining("unique"),
          }),
        );
      });
    });
  });

  describe("DELETE /api/users/{id}", () => {
    let userId: string;

    beforeEach(async () => {
      // Создаем пользователя для удаления
      const inputData: UserInputModel = {
        login: "ToDelete",
        email: "delete@example.com",
        password: "qwerty123",
      };
      userId = await usersService.create(inputData);
    });

    describe("Positive scenarios", () => {
      test("Should delete existing user", async () => {
        const response = await request(app)
          .delete(`/api/users/${userId}`)
          .set("Authorization", authToken);

        expect(response.status).toBe(204);

        // Проверяем, что пользователь удален
        const userInDb = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        expect(userInDb).toBeNull();
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without authorization", async () => {
        const response = await request(app).delete(`/api/users/${userId}`);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 404 for non-existent user", async () => {
        const nonExistentId = "507f1f77bcf86cd799439011";

        const response = await request(app)
          .delete(`/api/users/${nonExistentId}`)
          .set("Authorization", authToken);

        expect(response.status).toBe(404);
      });

      test("Should return 400 for invalid ID format", async () => {
        const response = await request(app)
          .delete("/api/users/invalid-id-format")
          .set("Authorization", authToken);

        expect(response.status).toBe(400);
      });
    });
  });
});
