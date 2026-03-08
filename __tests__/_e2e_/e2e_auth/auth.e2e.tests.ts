import request from "supertest";
import express from "express";
import { setupApp } from "../../../src/setup-app";
import { HttpStatus } from "../../../src/core/enums/http-status";
import { EndpointList } from "../../../src/core/constants/endpoint-list";
import { client, closeDBConnection, runDB } from "../../../src/db/mongo.db";
import { usersService } from "../../../src/users/BLL/users.service";
import { authDevicesRepository } from "../../../src/securityDevices/repositories/authDevices.repository";
import { authDevicesQueryRepository } from "../../../src/securityDevices/repositories/authDevices.query-repository";

// Хелпер: достаём значение refreshToken из Set-Cookie заголовка
const extractRefreshToken = (
  cookiesHeader: string | string[] | undefined,
): string => {
  if (!cookiesHeader) return "";
  if (Array.isArray(cookiesHeader)) {
    const refreshCookie = cookiesHeader.find((c: string) =>
      c.includes("refreshToken"),
    );
    return refreshCookie ? refreshCookie.split(";")[0].split("=")[1] : "";
  }
  return cookiesHeader.split(";")[0].split("=")[1];
};

let app: any;
const testUserLogin = "testuser";
const testUserEmail = "thalamus@smart.twc1.net";
const testUserPassword = "password123";
let accessToken: string;
let refreshToken: string;
let testUserId: string;

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);
});

beforeEach(async () => {
  // Очищаем пользователей и сессии перед каждым тестом
  await usersService.clear();
  await authDevicesRepository.clear();

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
  }
});

describe("Auth API End-to-End Tests", () => {
  // ─────────────────────────────────────────────
  // POST /api/auth/login
  // ─────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    describe("Positive scenarios", () => {
      test("Should login with login and return tokens", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({ loginOrEmail: testUserLogin, password: testUserPassword });

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("accessToken");
        expect(typeof response.body.accessToken).toBe("string");

        const cookies = response.headers["set-cookie"];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toContain("HttpOnly");
        expect(cookies[0]).toContain("Secure");
        expect(cookies[0]).toContain("SameSite=Strict");

        accessToken = response.body.accessToken;
        refreshToken = extractRefreshToken(cookies);
      });

      test("Should login with email and return tokens", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({ loginOrEmail: testUserEmail, password: testUserPassword });

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.headers["set-cookie"]).toBeDefined();
      });

      test("Each login should create a separate device session", async () => {
        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .set("User-Agent", "Device-A")
          .send({ loginOrEmail: testUserLogin, password: testUserPassword });

        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .set("User-Agent", "Device-B")
          .send({ loginOrEmail: testUserLogin, password: testUserPassword });

        const sessions =
          await authDevicesQueryRepository.findAllByUserId(testUserId);
        expect(sessions).toHaveLength(2);
        expect(sessions[0].deviceInfo.title).not.toBe(
          sessions[1].deviceInfo.title,
        );
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 400 for missing loginOrEmail", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({ password: testUserPassword });

        expect(response.status).toBe(HttpStatus.BadRequest);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: "loginOrEmail" }),
          ]),
        );
      });

      test("Should return 400 for missing password", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({ loginOrEmail: testUserLogin });

        expect(response.status).toBe(HttpStatus.BadRequest);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: "password" }),
          ]),
        );
      });

      test("Should return 401 for non-existent user", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({ loginOrEmail: "nonexistent", password: testUserPassword });

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 for wrong password", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({ loginOrEmail: testUserLogin, password: "wrongpassword" });

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/auth/refresh-token
  // ─────────────────────────────────────────────
  describe("POST /api/auth/refresh-token", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({ loginOrEmail: testUserLogin, password: testUserPassword });

      accessToken = response.body.accessToken;
      refreshToken = extractRefreshToken(response.headers["set-cookie"]);
    });

    describe("Positive scenarios", () => {
      test("Should return new token pair", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body.accessToken).not.toBe(accessToken);

        const newRefreshToken = extractRefreshToken(
          response.headers["set-cookie"],
        );
        expect(newRefreshToken).toBeDefined();
        expect(newRefreshToken).not.toBe(refreshToken);
      });

      test("Should NOT create new device session on refresh — same deviceId", async () => {
        const sessionsBefore =
          await authDevicesQueryRepository.findAllByUserId(testUserId);

        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        const sessionsAfter =
          await authDevicesQueryRepository.findAllByUserId(testUserId);

        // Количество сессий не должно измениться
        expect(sessionsAfter).toHaveLength(sessionsBefore.length);
        // deviceId должен остаться тем же
        expect(sessionsAfter[0].deviceInfo.deviceId).toBe(
          sessionsBefore[0].deviceInfo.deviceId,
        );
      });

      test("Should update lastActiveDate on refresh", async () => {
        const sessionsBefore =
          await authDevicesQueryRepository.findAllByUserId(testUserId);
        const lastActiveBefore = sessionsBefore[0].lastActiveDate;

        // Небольшая пауза чтобы дата гарантированно изменилась
        await new Promise((resolve) => setTimeout(resolve, 100));

        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        const sessionsAfter =
          await authDevicesQueryRepository.findAllByUserId(testUserId);
        const lastActiveAfter = sessionsAfter[0].lastActiveDate;

        expect(new Date(lastActiveAfter).getTime()).toBeGreaterThan(
          new Date(lastActiveBefore).getTime(),
        );
      });

      test("Old refresh token should not work after rotation", async () => {
        // Используем токен первый раз
        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        // Пытаемся использовать старый токен повторно
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without cookie", async () => {
        const response = await request(app).post(
          EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH,
        );
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid token", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", ["refreshToken=invalid.token.here"]);
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/auth/logout
  // ─────────────────────────────────────────────
  describe("POST /api/auth/logout", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({ loginOrEmail: testUserLogin, password: testUserPassword });

      refreshToken = extractRefreshToken(response.headers["set-cookie"]);
    });

    describe("Positive scenarios", () => {
      test("Should logout and clear cookie", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.NoContent);
        // После logout сессия должна удалиться из БД
        const sessions =
          await authDevicesQueryRepository.findAllByUserId(testUserId);
        expect(sessions).toHaveLength(0);
      });

      test("Should not be able to use refresh token after logout", async () => {
        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without cookie", async () => {
        const response = await request(app).post(
          EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH,
        );
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid token", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", ["refreshToken=invalid.token"]);
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/auth/me
  // ─────────────────────────────────────────────
  describe("GET /api/auth/me", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({ loginOrEmail: testUserLogin, password: testUserPassword });

      accessToken = response.body.accessToken;
    });

    describe("Positive scenarios", () => {
      test("Should return current user info", async () => {
        const response = await request(app)
          .get(EndpointList.AUTH_PATH + EndpointList.ME_PATH)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toEqual({
          email: testUserEmail,
          login: testUserLogin,
          userId: testUserId,
        });
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without header", async () => {
        const response = await request(app).get(
          EndpointList.AUTH_PATH + EndpointList.ME_PATH,
        );
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid token", async () => {
        const response = await request(app)
          .get(EndpointList.AUTH_PATH + EndpointList.ME_PATH)
          .set("Authorization", "Bearer invalidtoken");
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });
});
