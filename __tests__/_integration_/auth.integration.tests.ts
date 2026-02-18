import { nodemailerService } from "../../src/auth/adapters/emailSendler/nodemailer.service";
import { authService } from "../../src/auth/BLL/auth.service";
//@ts-ignore
import { testSeeder } from "./test.seeder";
import { ResultStatus } from "../../src/core/enums/result-statuses";
import { setupApp } from "../../src/setup-app";
import { client, closeDBConnection, runDB } from "../../src/db/mongo.db";
import express from "express";
import { usersService } from "../../src/users/BLL/users.service";

let app: any;
let testUserLogin = "testuser";
let testUserEmail = "test@example.com";
let testUserPassword = "password123";

describe("AUTH-INTEGRATION", () => {
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

  afterAll((done) => done());

  describe("User Registration", () => {
    //nodemailerService.sendEmail = emailServiceMock.sendEmail;

    nodemailerService.sendEmail = jest
      .fn()
      .mockImplementation(
        (email: string, code: string, template: (code: string) => string) =>
          Promise.resolve(true),
      );

    const registerUserUseCase = authService.registerUser;

    it("should register user with correct data", async () => {
      const { login, pass, email } = testSeeder.createUserDto();

      const result = await registerUserUseCase(login, pass, email);

      expect(result.status).toBe(ResultStatus.Success);
      expect(nodemailerService.sendEmail).toHaveBeenCalled();
      expect(nodemailerService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it("should not register user twice", async () => {
      const { login, pass, email } = testSeeder.createUserDto();
      await testSeeder.insertUser({ login, pass, email });

      const result = await registerUserUseCase(login, pass, email);

      expect(result.status).toBe(ResultStatus.BadRequest);
      //collection.countDoc().toBe(1)
    });
  });

  describe("Confirm email", () => {
    const confirmEmailUseCase = authService.confirmEmail;

    it("should not confirm email if user does not exist", async () => {
      const result = await confirmEmailUseCase("bnfgndflkgmk");

      expect(result.status).toBe(ResultStatus.BadRequest);
    });

    it("should not confirm email which is confirmed", async () => {
      const code = "test";

      const { login, pass, email } = testSeeder.createUserDto();
      await testSeeder.insertUser({
        login,
        pass,
        email,
        code,
        isConfirmed: true,
      });

      const result = await confirmEmailUseCase(code);

      expect(result.status).toBe(ResultStatus.BadRequest);
    });

    it("should not confirm email with expired code", async () => {
      const code = "test";

      const { login, pass, email } = testSeeder.createUserDto();
      await testSeeder.insertUser({
        login,
        pass,
        email,
        code,
        expirationDate: new Date().toISOString(),
      });

      const result = await confirmEmailUseCase(code);

      expect(result.status).toBe(ResultStatus.BadRequest);
      //check status in DB
    });

    it("confirm user", async () => {
      const code = "123e4567-e89b-12d3-a456-426614174000";

      const { login, pass, email } = testSeeder.createUserDto();
      await testSeeder.insertUser({ login, pass, email, code });

      const result = await confirmEmailUseCase(code);

      expect(result.status).toBe(ResultStatus.Success);
    });
  });
});
