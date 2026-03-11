import request from "supertest";
import express from "express";
import { setupApp } from "../../../src/setup-app";
import { HttpStatus } from "../../../src/core/enums/http-status";
import { EndpointList } from "../../../src/core/constants/endpoint-list";
import {
  client,
  closeDBConnection,
  rateLimitsCollection,
  runDB,
} from "../../../src/db/mongo.db";
import { UsersService } from "../../../src/users/BLL/users.service";
import { authDevicesRepository } from "../../../src/securityDevices/repositories/authDevices.repository";
import { deviceViewModel } from "../../../src/securityDevices/types/dto/device-view-model.dto";

// ─────────────────────────────────────────────
// Хелперы
// ─────────────────────────────────────────────

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

// Логинимся с указанным user-agent и возвращаем refreshToken
const loginAs = async (
  app: any,
  credentials: { loginOrEmail: string; password: string },
  userAgent: string,
): Promise<string> => {
  const response = await request(app)
    .post(EndpointList.AUTH_PATH + EndpointList.LOGIN_PATH)
    .set("User-Agent", userAgent)
    .send(credentials);

  return extractRefreshToken(response.headers["set-cookie"]);
};

const DEVICES_URL = EndpointList.SECURITY_DEVICES_PATH;

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

let app: any;
const testUserLogin = "testuser";
const testUserEmail = "test@example.com";
const testUserPassword = "password123";
const credentials = { loginOrEmail: testUserLogin, password: testUserPassword };

let testUserId: string;

// Токены четырёх устройств
let rtDevice1: string;
let rtDevice2: string;
let rtDevice3: string;
let rtDevice4: string;

beforeAll(async () => {
  await runDB(
    "mongodb+srv://Vercel-Admin-blogger-platform-mongoDB:hwkJaIheLnRD6J9c@blogger-platform-mongod.13rbnz7.mongodb.net/?retryWrites=true&w=majority",
  );
  app = express();
  setupApp(app);
});

beforeEach(async () => {
  await UsersService.clear();
  await authDevicesRepository.clear();
  await rateLimitsCollection.deleteMany({});

  testUserId = await UsersService.create({
    login: testUserLogin,
    email: testUserEmail,
    password: testUserPassword,
  });

  // Логиним пользователя 4 раза с разными user-agent
  rtDevice1 = await loginAs(app, credentials, "Chrome/Device-1");
  rtDevice2 = await loginAs(app, credentials, "Firefox/Device-2");
  rtDevice3 = await loginAs(app, credentials, "Safari/Device-3");
  rtDevice4 = await loginAs(app, credentials, "Edge/Device-4");
});

afterAll(async () => {
  try {
    await closeDBConnection(client);
  } catch (error) {
    console.error("Error closing DB connection:", error);
  }
});

// ─────────────────────────────────────────────
// Тесты
// ─────────────────────────────────────────────

describe("Security Devices API End-to-End Tests", () => {
  // ─────────────────────────────────────────────
  // GET /security/devices
  // ─────────────────────────────────────────────
  describe("GET /security/devices", () => {
    describe("Positive scenarios", () => {
      test("Should return list of 4 active sessions", async () => {
        const response = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveLength(4);
      });

      test("Each session should have required fields", async () => {
        const response = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        const devices: deviceViewModel[] = response.body;
        devices.forEach((device) => {
          expect(device).toHaveProperty("deviceId");
          expect(device).toHaveProperty("title");
          expect(device).toHaveProperty("ip");
          expect(device).toHaveProperty("lastActiveDate");
        });
      });

      test("Titles should match user-agents used during login", async () => {
        const response = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        const devices: deviceViewModel[] = response.body;
        const titles = devices.map((d: deviceViewModel) => d.title);
        expect(titles).toContain("Chrome/Device-1");
        expect(titles).toContain("Firefox/Device-2");
        expect(titles).toContain("Safari/Device-3");
        expect(titles).toContain("Edge/Device-4");
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without cookie", async () => {
        const response = await request(app).get(DEVICES_URL);
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid token", async () => {
        const response = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", ["refreshToken=invalid.token"]);
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });

  // ─────────────────────────────────────────────
  // Refresh токена девайса 1 → проверяем что список не изменился
  // ─────────────────────────────────────────────
  describe("Refresh device1 token → device list integrity", () => {
    test("Count and deviceIds should not change after refresh", async () => {
      // Получаем список ДО refresh
      const beforeResponse = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${rtDevice1}`]);

      const devicesBefore: deviceViewModel[] = beforeResponse.body;
      const deviceIdsBefore = devicesBefore.map((d) => d.deviceId).sort();
      const lastActiveBefore = devicesBefore.find(
        (d) => d.title === "Chrome/Device-1",
      )!.lastActiveDate;

      // Небольшая пауза чтобы lastActiveDate гарантированно изменилась
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Обновляем токен девайса 1
      const refreshResponse = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
        .set("Cookie", [`refreshToken=${rtDevice1}`]);

      expect(refreshResponse.status).toBe(HttpStatus.Ok);
      const newRtDevice1 = extractRefreshToken(
        refreshResponse.headers["set-cookie"],
      );

      // Получаем список ПОСЛЕ refresh (новым токеном)
      const afterResponse = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${newRtDevice1}`]);

      const devicesAfter: deviceViewModel[] = afterResponse.body;
      const deviceIdsAfter = devicesAfter.map((d) => d.deviceId).sort();
      const lastActiveAfter = devicesAfter.find(
        (d) => d.title === "Chrome/Device-1",
      )!.lastActiveDate;

      // Количество сессий не изменилось
      expect(devicesAfter).toHaveLength(devicesBefore.length);

      // deviceId всех устройств не изменились
      expect(deviceIdsAfter).toEqual(deviceIdsBefore);

      // lastActiveDate девайса 1 изменилась
      expect(new Date(lastActiveAfter).getTime()).toBeGreaterThan(
        new Date(lastActiveBefore).getTime(),
      );
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /security/devices/:deviceId — удаление конкретной сессии
  // ─────────────────────────────────────────────
  describe("DELETE /security/devices/:deviceId", () => {
    describe("Positive scenarios", () => {
      test("Should delete device2 using device1 token", async () => {
        // Получаем deviceId девайса 2
        const listResponse = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        const device2 = listResponse.body.find(
          (d: deviceViewModel) => d.title === "Firefox/Device-2",
        );
        expect(device2).toBeDefined();

        // Удаляем девайс 2 токеном девайса 1
        const deleteResponse = await request(app)
          .delete(`${DEVICES_URL}/${device2.deviceId}`)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(deleteResponse.status).toBe(HttpStatus.NoContent);

        // Проверяем что девайса 2 больше нет в списке
        const afterResponse = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(afterResponse.body).toHaveLength(3);
        const titles = afterResponse.body.map((d: deviceViewModel) => d.title);
        expect(titles).not.toContain("Firefox/Device-2");
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without cookie", async () => {
        const listResponse = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        const device2 = listResponse.body.find(
          (d: deviceViewModel) => d.title === "Firefox/Device-2",
        );

        const response = await request(app).delete(
          `${DEVICES_URL}/${device2.deviceId}`,
        );
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 404 for non-existent deviceId", async () => {
        const response = await request(app)
          .delete(`${DEVICES_URL}/non-existent-device-id`)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(response.status).toBe(HttpStatus.NotFound);
      });

      test("Should return 403 when trying to delete someone else's session", async () => {
        // Создаём второго пользователя
        const otherUserId = await UsersService.create({
          login: "otheruser",
          email: "other@example.com",
          password: "password123",
        });

        // Логиним второго пользователя
        const otherRt = await loginAs(
          app,
          { loginOrEmail: "otheruser", password: "password123" },
          "Other-Device",
        );

        // Получаем deviceId сессии второго пользователя
        const otherDevicesResponse = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${otherRt}`]);

        const otherDevice = otherDevicesResponse.body[0];

        // Пытаемся удалить сессию второго пользователя токеном первого
        const response = await request(app)
          .delete(`${DEVICES_URL}/${otherDevice.deviceId}`)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(response.status).toBe(HttpStatus.Forbidden);
      });
    });
  });

  // ─────────────────────────────────────────────
  // Logout девайсом 3 → проверяем что его нет в списке
  // ─────────────────────────────────────────────
  describe("Logout device3 → check device list", () => {
    test("Device3 should disappear from list after logout", async () => {
      // Логаутим девайс 3
      const logoutResponse = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
        .set("Cookie", [`refreshToken=${rtDevice3}`]);

      expect(logoutResponse.status).toBe(HttpStatus.NoContent);

      // Проверяем список девайсом 1
      const listResponse = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${rtDevice1}`]);

      expect(listResponse.body).toHaveLength(3);
      const titles = listResponse.body.map((d: deviceViewModel) => d.title);
      expect(titles).not.toContain("Safari/Device-3");
    });

    test("Device3 refresh token should be invalid after logout", async () => {
      await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
        .set("Cookie", [`refreshToken=${rtDevice3}`]);

      const response = await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
        .set("Cookie", [`refreshToken=${rtDevice3}`]);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /security/devices — удаление всех кроме текущей
  // ─────────────────────────────────────────────
  describe("DELETE /security/devices", () => {
    describe("Positive scenarios", () => {
      test("Should delete all sessions except current (device1)", async () => {
        const deleteResponse = await request(app)
          .delete(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(deleteResponse.status).toBe(HttpStatus.NoContent);

        // Запрашиваем список — должен остаться только девайс 1
        const listResponse = await request(app)
          .get(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(listResponse.body).toHaveLength(1);
        expect(listResponse.body[0].title).toBe("Chrome/Device-1");
      });

      test("Deleted devices tokens should be invalid after bulk delete", async () => {
        await request(app)
          .delete(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        // Девайс 2, 3, 4 не должны работать
        for (const rt of [rtDevice2, rtDevice3, rtDevice4]) {
          const response = await request(app)
            .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
            .set("Cookie", [`refreshToken=${rt}`]);
          expect(response.status).toBe(HttpStatus.Unauthorized);
        }
      });

      test("Current device token should still work after bulk delete", async () => {
        await request(app)
          .delete(DEVICES_URL)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        const response = await request(app)
          .post(EndpointList.AUTH_PATH + EndpointList.REFRESH_TOKEN_PATH)
          .set("Cookie", [`refreshToken=${rtDevice1}`]);

        expect(response.status).toBe(HttpStatus.Ok);
      });
    });

    describe("Negative scenarios", () => {
      test("Should return 401 without cookie", async () => {
        const response = await request(app).delete(DEVICES_URL);
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });

      test("Should return 401 with invalid token", async () => {
        const response = await request(app)
          .delete(DEVICES_URL)
          .set("Cookie", ["refreshToken=invalid.token"]);
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });
  });

  // ─────────────────────────────────────────────
  // Дополнительные тесты
  // ─────────────────────────────────────────────
  describe("Additional edge cases", () => {
    test("Should isolate sessions between different users", async () => {
      await UsersService.create({
        login: "otheruser",
        email: "other@example.com",
        password: "password123",
      });

      await loginAs(
        app,
        { loginOrEmail: "otheruser", password: "password123" },
        "Other-Browser",
      );

      // Первый пользователь должен видеть только свои 4 сессии
      const response = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${rtDevice1}`]);

      expect(response.body).toHaveLength(4);
      const titles = response.body.map((d: deviceViewModel) => d.title);
      expect(titles).not.toContain("Other-Browser");
    });

    test("All 4 sessions should have unique deviceIds", async () => {
      const response = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${rtDevice1}`]);

      const deviceIds = response.body.map((d: deviceViewModel) => d.deviceId);
      const uniqueIds = new Set(deviceIds);
      expect(uniqueIds.size).toBe(4);
    });

    test("Should not be able to use device3 token to get session list after device3 logout", async () => {
      await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
        .set("Cookie", [`refreshToken=${rtDevice3}`]);

      const response = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${rtDevice3}`]);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    test("Re-login after logout should create new session", async () => {
      // Логаутим девайс 1
      await request(app)
        .post(EndpointList.AUTH_PATH + EndpointList.LOGOUT_PATH)
        .set("Cookie", [`refreshToken=${rtDevice1}`]);

      // Логинимся снова с тем же user-agent
      const newRt = await loginAs(app, credentials, "Chrome/Device-1-Relogin");

      const response = await request(app)
        .get(DEVICES_URL)
        .set("Cookie", [`refreshToken=${newRt}`]);

      // Должно быть 4 сессии (3 старых + 1 новая)
      expect(response.body).toHaveLength(4);
    });
  });
});
