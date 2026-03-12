import { AuthService } from "../BLL/auth.service";
import { UsersQueryRepository } from "../../users/repositories/users.query-repository";
import {
  RequestWithBody,
  RequestWithUserData,
} from "../../core/types/request-types";
import { IdType } from "../../core/types/id-type";
import { NextFunction, Response } from "express";
import { HttpStatus } from "../../core/enums/http-status";
import { LoginInputModel } from "../types/login-Input-model";
import { randomUUID } from "crypto";
import { ResultStatus } from "../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../core/utils/result-code-to-http-status.mapper";
import { JwtService } from "../adapters/jwt.service";
import { TokensTypes } from "../adapters/enums/tokens-types";
import { appConfig } from "../../core/config/appConfig";
import { CookieNames } from "../../core/constants/cookie-names";
import { UserInputModel } from "../../users/types/inputTypes/user-input-model";
import { createErrorMessages } from "../../core/utils/error.utils";
import { inject, injectable } from "inversify";

@injectable()
export class AuthController {
  constructor(
    @inject(AuthService)
    private authService: AuthService,
    @inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository,
    @inject(JwtService)
    private jwtService: JwtService,
  ) {}

  async getLoggedUser(
    req: RequestWithUserData<IdType>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = req.userData!.userId;

    if (!userId) {
      res.status(HttpStatus.Unauthorized).send("Request not contains userId");
      return;
    }

    try {
      const me = await this.usersQueryRepository.getMe(userId);
      res.status(HttpStatus.Ok).send(me);
    } catch (e) {
      next(e);
    }
  }

  async login(
    req: RequestWithBody<LoginInputModel>,
    res: Response,
  ): Promise<void> {
    const loginOrEmail: string = req.body.loginOrEmail;
    const password: string = req.body.password;
    const deviceId = randomUUID();
    const result = await this.authService.loginUser(
      loginOrEmail,
      password,
      deviceId,
    );

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(result.extensions);
      return;
    }

    const decoded = this.jwtService.verifyToken(
      result.data!.refreshToken!,
      TokensTypes.RT,
    );

    await this.authService.createAuthDeviceSession({
      userId: result.data!.userId,
      refreshTokenVersion: decoded!.iat!,
      deviceInfo: {
        deviceId: deviceId,
        title: req.headers["user-agent"] || "unknown",
        ip: req.ip || null,
      },
      issuedAt: new Date(),
      expireAt: new Date(
        new Date().getTime() + Number(appConfig.RT_TOKEN_TIME),
      ),
      lastActiveDate: new Date(),
    });

    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .cookie(CookieNames.REFRESH_TOKEN, result.data!.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: appConfig.RT_TOKEN_TIME + 1000, // Устанавливаем время жизни куки чуть больше, чем время жизни RT, чтобы гарантировать удаление куки после истечения срока действия токена
      })
      .send({ accessToken: result.data!.accessToken });
  }

  async logout(req: RequestWithUserData<IdType>, res: Response): Promise<void> {
    const deviceId: string = req.userData!.deviceId!;

    const deleteSessionResult = await this.authService.deleteSession(deviceId);
    if (deleteSessionResult.status !== ResultStatus.Success) {
      res
        .status(HttpStatus.InternalServerError)
        .send(deleteSessionResult.errorMessage);
      return;
    }

    res
      .clearCookie(CookieNames.REFRESH_TOKEN)
      .status(HttpStatus.NoContent)
      .send();
  }

  async registration(
    req: RequestWithBody<UserInputModel>,
    res: Response,
  ): Promise<void> {
    const { login, password, email } = req.body;
    const result = await this.authService.registerUser(login, email, password);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(createErrorMessages(result.extensions));
      return;
    }

    res.status(HttpStatus.NoContent).send();
  }

  async registrationConfirmation(
    req: RequestWithBody<{ code: string }>,
    res: Response,
  ): Promise<void> {
    const code: string = req.body.code;
    const result = await this.authService.confirmEmail(code);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(createErrorMessages(result.extensions));
      return;
    }

    res.status(HttpStatus.NoContent).send();
  }

  async registrationEmailResending(
    req: RequestWithBody<{ email: string }>,
    res: Response,
  ): Promise<void> {
    const { email } = req.body;

    const result = await this.authService.resendEmail(email);
    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(createErrorMessages(result.extensions));
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
  }

  async updateTokens(
    req: RequestWithUserData<IdType>,
    res: Response,
  ): Promise<void> {
    const userId = req.userData!.userId;
    const deviceId = req.userData!.deviceId!;

    const result = await this.authService.rotateTokensPair(deviceId, userId);
    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(result.extensions);
      return;
    }

    res
      .status(HttpStatus.Ok)
      .cookie(CookieNames.REFRESH_TOKEN, result.data!.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: appConfig.RT_TOKEN_TIME + 10000,
      })
      .send({ accessToken: result.data!.accessToken });
  }
}
