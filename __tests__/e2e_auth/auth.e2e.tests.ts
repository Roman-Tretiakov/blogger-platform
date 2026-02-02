import request from "supertest";
import express from "express";
import { setupApp } from "../../src/setup-app";
import { HttpStatus } from "../../src/core/enums/http-status";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { beforeEach, describe } from "node:test";
import {
  client,
  closeDBConnection,
  runDB
} from "../../src/db/mongo.db";
import { usersService } from "../../src/users/BLL/users.service";

let app: any;

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

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // Создаем тестового пользователя
    await usersService.create({
      login: "testuser",
      email: "test@example.com",
      password: "password123",
    });
  });

  describe("Positive scenarios", () => {
    test("Should login with valid login credentials", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "testuser",
        password: "password123", 
      });

      expect(response.status).toBe(HttpStatus.NoContent);
    });

    test("Should login with valid email credentials", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(HttpStatus.NoContent);
    });
  });

  describe("Negative scenarios", () => {
    test("Should return 400 for invalid request body", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        // Отсутствует одно из обязательных полей
        loginOrEmail: "testuser",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toHaveProperty("errorsMessages");
    });

    test("Should return 400 for empty loginOrEmail", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "",
        password: "password123",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    test("Should return 400 for empty password", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "testuser",
        password: "",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    test("Should return 401 for non-existent login", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "nonexistent",
        password: "password123",
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    test("Should return 401 for non-existent email", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    test("Should return 401 for incorrect password", async () => {
      const response = await request(app).post(EndpointList.AUTH_PATH).send({
        loginOrEmail: "testuser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });
});
