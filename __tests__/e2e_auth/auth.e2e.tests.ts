import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { beforeEach, describe } from "node:test";
import { client, closeDBConnection, runDB } from "../../src/db/mongo.db";
import { usersService } from "../../src/users/BLL/users.service";

let app: any;
let testUserLogin = "testuser";
let testUserEmail = "test@example.com";
let testUserPassword = "password123";
let accessToken: string;
let testUserId: string;

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);
});

beforeEach(async () => {
  await usersService.clear();

  testUserId = await usersService.create({
    login: testUserLogin,
    email: testUserEmail,
    password: testUserPassword,
  });
});

afterAll(async () => {
  try {
    await closeDBConnection(client);
  } catch (error) {
    console.error("Error closing DB connection:", error);
    // Можно не бросать ошибку дальше, чтобы не влиять на результат тестов
  }
});

describe("POST /api/auth/login", () => {
  describe("Positive scenarios", () => {
    test("Should return JWT token with valid credentials using login", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: testUserLogin,
          password: testUserPassword,
        });
      accessToken = response.body.accessToken; // Сохраняем токен для последующих тестов

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });

    test("Should return JWT token with valid credentials using email", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: testUserEmail,
          password: testUserPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 400 for invalid request body", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          // loginOrEmail missing
          password: testUserPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errorsMessages");
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      );
    });

    test("Should return 400 for empty loginOrEmail", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: "",
          password: testUserPassword,
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    test("Should return 400 for empty password", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: "testuser",
          password: "",
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    test("Should return 401 for non-existent login", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: "nonexistent",
          password: testUserPassword,
        });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    test("Should return 401 for non-existent email", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: "nonexistent@example.com",
          password: testUserPassword,
        });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    test("Should return 401 for incorrect password", async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: testUserLogin,
          password: "wrongpassword",
        });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });
});

describe("GET /api/auth/me", () => {
  describe("Positive scenarios", () => {
    test("Should return current user info with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      const testUserId = Request;

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        email: testUserEmail,
        login: testUserLogin,
        userId: testUserId,
      });
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 401 without authorization header", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
    });

    test("Should return 401 with invalid token format", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "InvalidTokenFormat");

      expect(response.status).toBe(401);
    });
  });
});
