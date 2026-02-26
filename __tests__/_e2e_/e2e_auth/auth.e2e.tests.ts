import request from "supertest";
import express from "express";
import { setupApp } from "../../../src/setup-app";
import { HttpStatus } from "../../../src/core/enums/http-status";
import { EndpointList } from "../../../src/core/constants/endpoint-list";
import {
  client,
  closeDBConnection,
  runDB,
  runTokensDB,
} from "../../../src/db/mongo.db";
import { usersService } from "../../../src/users/BLL/users.service";

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

  // Если это строка
  return cookiesHeader.split(";")[0].split("=")[1];
};

let app: any;
let testUserLogin = "testuser";
let testUserEmail = "thalamus@smart.twc1.net";
let testUserPassword = "password123";
let accessToken: string;
let refreshToken: string;
let testUserId: string;
let confirmationCode: string;

beforeAll(async () => {
  await runDB(process.env.MONGODB_URI!);
  await runTokensDB(process.env.RT_TOKENS_MONGODB_URI!);
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
  }
});

describe("Auth API End-to-End Tests", () => {
  describe("POST /api/auth/login", () => {
    describe("Positive scenarios", () => {
      test("Should login with login and return tokens", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({
            loginOrEmail: testUserLogin,
            password: testUserPassword,
          });

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("accessToken");
        expect(typeof response.body.accessToken).toBe("string");
        expect(response.body.accessToken.length).toBeGreaterThan(0);

        // Проверяем cookie с refresh token
        const cookies = response.headers["set-cookie"];
        expect(cookies).toBeDefined();
        const refreshCookie = extractRefreshToken(cookies);
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toContain("HttpOnly");
        expect(refreshCookie).toContain("Secure");
        expect(refreshCookie).toContain("SameSite=Strict");
        expect(refreshCookie).toContain("Max-Age=20");
        expect(refreshCookie).toContain("Path=/api/auth/refresh-token");

        // Сохраняем токены для других тестов
        accessToken = response.body.accessToken;
        refreshToken = refreshCookie.split(";")[0].split("=")[1];
      });

      test("Should login with email and return tokens", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({
            loginOrEmail: testUserEmail,
            password: testUserPassword,
          });

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.headers["set-cookie"]).toBeDefined();
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 400 for missing loginOrEmail", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({
            password: testUserPassword,
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
        expect(response.body).toHaveProperty("errorsMessages");
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: "loginOrEmail",
              message: expect.any(String),
            }),
          ]),
        );
      });

      test("Should return 400 for missing password", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
          .send({
            loginOrEmail: testUserLogin,
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: "password",
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
            loginOrEmail: testUserLogin,
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
    beforeAll(() => {
      // Получаем валидный access token перед тестами me
      return request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: testUserLogin,
          password: testUserPassword,
        })
        .then((response) => {
          accessToken = response.body.accessToken;
        });
    });

    describe("Positive scenarios", () => {
      test("Should return current user info with valid token", async () => {
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
      test("Should return 401 without authorization header", async () => {
        const response = await request(app).get(
          EndpointList.AUTH_PATH + EndpointList.ME_PATH,
        );

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid token format", async () => {
        const response = await request(app)
          .get(EndpointList.AUTH_PATH + EndpointList.ME_PATH)
          .set("Authorization", "InvalidTokenFormat");

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with expired token", async () => {
        // Ждем 11 секунд пока токен истечет (access token живет 10 секунд)
        await new Promise((resolve) => setTimeout(resolve, 11000));

        const response = await request(app)
          .get(EndpointList.AUTH_PATH + EndpointList.ME_PATH)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      }, 15000); // Увеличиваем таймаут для этого теста
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    beforeAll(async () => {
      // Получаем валидную пару токенов перед тестами refresh-token
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: testUserLogin,
          password: testUserPassword,
        });

      accessToken = response.body.accessToken;
      const cookies = response.headers["set-cookie"];
      //const refreshCookie = extractRefreshToken(cookies);
      refreshToken = extractRefreshToken(cookies);
    });

    describe("Positive scenarios", () => {
      test("Should refresh tokens successfully", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body.accessToken).not.toBe(accessToken); // Новый access token

        // Проверяем новую refresh token cookie
        const cookies = response.headers["set-cookie"];
        expect(cookies).toBeDefined();
        const newRefreshCookie = extractRefreshToken(cookies);
        expect(newRefreshCookie).toBeDefined();
        expect(newRefreshCookie).toContain("HttpOnly");
        expect(newRefreshCookie).toContain("Secure");
        expect(newRefreshCookie).toContain("Max-Age=20");

        // Обновляем токены для следующих тестов
        accessToken = response.body.accessToken;
        refreshToken = newRefreshCookie.split(";")[0].split("=")[1];
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without refresh token cookie", async () => {
        const response = await request(app).post(
          EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH,
        );

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid refresh token", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", ["refreshToken=invalid.token.here"]);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with expired refresh token", async () => {
        // Ждем 21 секунду пока refresh token истечет (живет 20 секунд)
        await new Promise((resolve) => setTimeout(resolve, 21000));

        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      }, 25000);

      test("Should revoke old refresh token after use", async () => {
        // Получаем новые токены
        const response1 = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response1.status).toBe(HttpStatus.Ok);

        // Пытаемся использовать старый refresh token снова
        const response2 = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response2.status).toBe(HttpStatus.Unauthorized);

        // Обновляем refreshToken для следующих тестов
        const cookies = response1.headers["set-cookie"];
        //const newRefreshCookie = extractRefreshToken(cookies);
        refreshToken = extractRefreshToken(cookies);
      });
    });
  });

  describe("POST /api/auth/logout", () => {
    beforeAll(async () => {
      // Получаем валидную пару токенов перед тестами logout
      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
        .send({
          loginOrEmail: testUserLogin,
          password: testUserPassword,
        });

      const cookies = response.headers["set-cookie"];
      //const refreshCookie = extractRefreshToken(cookies);
      refreshToken = extractRefreshToken(cookies);
    });

    describe("Positive scenarios", () => {
      test("Should logout successfully and clear cookie", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.NoContent);

        // Проверяем что cookie очищена
        const cookies = response.get("Set-Cookie");
        expect(cookies).toBeDefined();
        const clearCookie = extractRefreshToken(cookies);
        expect(clearCookie).toContain("Max-Age=0");
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without refresh token cookie", async () => {
        const response = await request(app).post(
          EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH,
        );

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid refresh token", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", ["refreshToken=invalid.token.here"]);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with already revoked token", async () => {
        // Сначала выходим
        await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        // Пытаемся выйти снова с тем же токеном
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
          .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });

  describe("POST /api/auth/registration", () => {
    const newUser = {
      login: "newuser",
      email: "newuser@example.com",
      password: "newpassword123",
    };

    describe("Positive scenarios", () => {
      test("Should register user successfully", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
          .send(newUser);

        expect(response.status).toBe(HttpStatus.NoContent);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 400 if user with login already exists", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
          .send({
            ...newUser,
            login: testUserLogin, // Существующий логин
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: "login",
              message: expect.any(String),
            }),
          ]),
        );
      });

      test("Should return 400 if user with email already exists", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
          .send({
            ...newUser,
            email: testUserEmail, // Существующий email
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
        expect(response.body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: "email",
              message: expect.any(String),
            }),
          ]),
        );
      });

      test("Should return 400 for invalid login format", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
          .send({
            ...newUser,
            login: "a", // Слишком короткий
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 for invalid email format", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
          .send({
            ...newUser,
            email: "invalid-email",
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 for invalid password format", async () => {
        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
          .send({
            ...newUser,
            password: "123", // Слишком короткий
          });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("POST /api/auth/registration-confirmation", () => {
    beforeAll(async () => {
      // Регистрируем нового пользователя и сохраняем код подтверждения
      await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.REGISTRATION_PATH)
        .send({
          login: "confirmuser",
          email: "confirm@example.com",
          password: "confirmpass123",
        });

      // В реальном приложении здесь нужно получить код из email-сервиса
      // Для тестов можно замокать или получить из БД
      confirmationCode = "test-confirmation-code"; // Замените на реальное получение кода
    });

    describe("Positive scenarios", () => {
      test("Should confirm registration with valid code", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_CONFIRMATION_PATH,
          )
          .send({ code: confirmationCode });

        expect(response.status).toBe(HttpStatus.NoContent);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 400 with invalid confirmation code", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_CONFIRMATION_PATH,
          )
          .send({ code: "invalid-code" });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 with expired confirmation code", async () => {
        // Ждем пока код истечет (предположим что код живет 24 часа)
        // В реальном тесте можно использовать специальный тестовый код с коротким сроком
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_CONFIRMATION_PATH,
          )
          .send({ code: "expired-code" });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 with already confirmed code", async () => {
        // Сначала подтверждаем
        await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_CONFIRMATION_PATH,
          )
          .send({ code: confirmationCode });

        // Пытаемся подтвердить снова
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_CONFIRMATION_PATH,
          )
          .send({ code: confirmationCode });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 without code", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_CONFIRMATION_PATH,
          )
          .send({});

        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("POST /api/auth/registration-email-resending", () => {
    describe("Positive scenarios", () => {
      test("Should resend confirmation email", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
          )
          .send({ email: "unconfirmed@example.com" });

        expect(response.status).toBe(HttpStatus.NoContent);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 400 for already confirmed email", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
          )
          .send({ email: testUserEmail }); // Уже подтвержденный email

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 for non-existent email", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
          )
          .send({ email: "nonexistent@example.com" });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 for invalid email format", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
          )
          .send({ email: "invalid-email" });

        expect(response.status).toBe(HttpStatus.BadRequest);
      });

      test("Should return 400 without email", async () => {
        const response = await request(app)
          .post(
            EndpointList.AUTH_PATH +
              EndpointList.REGISTRATION_EMAIL_RESENDING_PATH,
          )
          .send({});

        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });
});
