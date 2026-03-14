import { UsersQueryRepository } from "../../users/repositories/users.query-repository";
import { BcryptService } from "../adapters/bcrypt.service";
import { Result } from "../../core/types/result-object-type";
import { PairTokensViewModel } from "../routers/outputTypes/pair-tokens-view-model";
import { ResultStatus } from "../../core/enums/result-statuses";
import { JwtService } from "../adapters/jwt.service";
import { User } from "../../users/BLL/user-entity";
import { MailServices } from "../adapters/enums/mail-services";
import { UsersRepository } from "../../users/repositories/users.repository";
import { emailExamples } from "../adapters/emailSendler/emailExamples";
import { randomUUID } from "crypto";
import { TokensTypes } from "../adapters/enums/tokens-types";
import { UserIdModel } from "../types/userId-model";
import { AuthDevicesSessions } from "../../securityDevices/BLL/types/auth-devices-sessions.interface";
import { NodemailerService } from "../adapters/emailSendler/nodemailer.service";
import { AuthDevicesQueryRepository } from "../../securityDevices/repositories/authDevices.query-repository";
import { AuthDevicesRepository } from "../../securityDevices/repositories/authDevices.repository";
import { injectable, inject } from "inversify";

@injectable()
export class AuthService {
  constructor(
    @inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository,
    @inject(UsersRepository)
    private usersRepository: UsersRepository,
    @inject(BcryptService)
    private bcryptService: BcryptService,
    @inject(JwtService)
    private jwtService: JwtService,
    @inject(NodemailerService)
    private nodemailerService: NodemailerService,
    @inject(AuthDevicesRepository)
    private authDevicesRepository: AuthDevicesRepository,
    @inject(AuthDevicesQueryRepository)
    private authDevicesQueryRepository: AuthDevicesQueryRepository,
  ) {}

  async registerUser(
    login: string,
    email: string,
    password: string,
  ): Promise<Result> {
    const result = await this.checkLoginAndPassword([login, email], password);

    if (result) {
      const user = await this.usersQueryRepository.getUserById(result);
      const loginMatch = user.login === login;
      const emailMatch = user.email === email;
      let field: string;
      if (loginMatch && emailMatch) {
        field = "loginAndEmail";
      } else if (loginMatch) {
        field = "login";
      } else {
        field = "email";
      }
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "User with such login or email already exists!",
        extensions: [
          {
            field: field,
            message: "User with such login or email already exists!",
          },
        ],
        data: null,
      };
    }

    const passwordHash = await this.bcryptService.generateHash(password);
    const newUser = new User(login, email, passwordHash);
    newUser.generateNewConfirmationCode().isEmailConfirmed(false);

    await this.usersRepository.create(newUser).catch(() => {
      return {
        status: ResultStatus.Failure,
        errorMessage: "Something went wrong during user creation!",
        extensions: [],
        data: null,
      };
    });

    this.nodemailerService
      .sendEmail(
        MailServices.MAIL_RU,
        email,
        newUser.confirmationCode!,
        emailExamples.registrationEmail,
      )
      .catch((e: any) => {
        console.error("Failed to send confirmation email:", e);
      });

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  }

  async confirmEmail(code: string): Promise<Result> {
    const user =
      await this.usersQueryRepository.findUserByConfirmationCode(code);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Wrong confirmation code!",
        extensions: [
          {
            field: "code",
            message: "Confirmation code is incorrect!",
          },
        ],
        data: null,
      };
    } else {
      if (new Date(user.expirationDate!) < new Date()) {
        return {
          status: ResultStatus.BadRequest,
          errorMessage: "Wrong confirmation code!",
          extensions: [
            {
              field: "code",
              message: "Confirmation code is expired!",
            },
          ],
          data: null,
        };
      }
      if (user.isConfirmed) {
        return {
          status: ResultStatus.BadRequest,
          errorMessage: "Wrong confirmation code!",
          extensions: [
            {
              field: "code",
              message: "Email is already been applied!",
            },
          ],
          data: null,
        };
      }

      user.isConfirmed = true;
      await this.usersRepository
        .update(user._id.toString(), {
          ...user,
        })
        .catch(() => {
          return {
            status: ResultStatus.Failure,
            errorMessage: "Something went wrong during email confirmation!",
            extensions: [],
            data: null,
          };
        });
    }

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  }

  async resendEmail(email: string): Promise<Result> {
    const user = await this.usersQueryRepository.findByLoginOrEmail([email]);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "User with such email doesn't exist!",
        extensions: [
          {
            field: "email",
            message: "User with such email doesn't exist!",
          },
        ],
        data: null,
      };
    }
    if (user.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Email is already been applied!",
        extensions: [
          {
            field: "email",
            message: "Email is already been applied!",
          },
        ],
        data: null,
      };
    }

    user.isConfirmed = false;
    user.confirmationCode = randomUUID();
    this.nodemailerService
      .sendEmail(
        MailServices.MAIL_RU,
        email,
        user.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((e: any) => {
        console.error("Failed to send confirmation email:", e);
      });

    await this.usersRepository.update(user._id.toString(), {
      ...user,
    });

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  }

  async loginUser(
    loginOrEmail: string,
    password: string,
    deviceId: string,
  ): Promise<Result<UserIdModel | null>> {
    const userId = await this.checkLoginAndPassword([loginOrEmail], password);

    if (!userId) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: ResultStatus.Unauthorized,
        extensions: [{ field: "loginOrEmail", message: "Wrong credentials!" }],
      };
    }

    const accessToken = this.jwtService.createToken(userId, TokensTypes.AT);
    const refreshToken = this.jwtService.createToken(
      userId,
      TokensTypes.RT,
      deviceId,
    );

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: {
        userId: userId,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async checkLoginAndPassword(
    loginAndEmail: string[],
    password: string,
  ): Promise<string | null> {
    const user =
      await this.usersQueryRepository.findByLoginOrEmail(loginAndEmail);
    if (!user) {
      return null;
    }

    const isPasswordCorrect = await this.bcryptService.checkPassword(
      password,
      user!.password,
    );
    if (!isPasswordCorrect) {
      return null;
    }

    return user._id.toString();
  }

  async rotateTokensPair(
    deviceId: string,
    userId: string,
  ): Promise<Result<PairTokensViewModel | null>> {
    const session =
      await this.authDevicesQueryRepository.findByDeviceId(deviceId);
    if (!session) {
      return {
        status: ResultStatus.Failure,
        errorMessage: "Session not found!",
        extensions: [],
        data: null,
      };
    }

    const refreshToken = this.jwtService.createToken(
      userId,
      TokensTypes.RT,
      deviceId,
    );
    const accessToken = this.jwtService.createToken(userId, TokensTypes.AT);

    const decoded = this.jwtService.verifyToken(refreshToken, TokensTypes.RT);
    await this.authDevicesRepository.updateLastActiveDate(
      deviceId,
      decoded!.jti!,
    );

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async deleteSession(deviceId: string): Promise<Result> {
    const deleteCount =
      await this.authDevicesRepository.deleteByDeviceId(deviceId);
    if (deleteCount < 1) {
      return {
        status: ResultStatus.Failure,
        errorMessage: `Error happened during session deleting, device id: ${deviceId}`,
        extensions: [],
        data: null,
      };
    }
    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  }

  async createAuthDeviceSession(session: AuthDevicesSessions): Promise<void> {
    await this.authDevicesRepository.create(session);
  }

  async deleteAllSessionsExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await this.authDevicesRepository.deleteAllExceptCurrent(
      userId,
      currentDeviceId,
    );
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<Result<AuthDevicesSessions | null>> {
    const session =
      await this.authDevicesQueryRepository.findByDeviceId(deviceId);
    if (!session) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Session not found!",
        extensions: [],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: session,
    };
  }

  async recoverPassword(email: string): Promise<Result> {
    const user = await this.usersQueryRepository.findByLoginOrEmail([email]);
    if (user) {
      const code = randomUUID();
      await this.usersRepository.update(user._id.toString(), {
        ...user,
        passwordRecoveryCode: code,
        passwordRecoveryExpiration: new Date(
          Date.now() + 3600000,
        ).toISOString(), // 1 hour
      });

      this.nodemailerService
        .sendEmail(
          MailServices.MAIL_RU,
          email,
          code,
          emailExamples.passwordRecoveryEmail,
        )
        .catch((e: any) => {
          console.error("Failed to send password recovery to email: ", e);
        });
    }

    return {
      status: ResultStatus.NoContent,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  }

  async newPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<Result> {
    const user =
      await this.usersQueryRepository.findUserByPasswordRecoveryCode(
        recoveryCode,
      );
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Wrong recovery code!",
        extensions: [],
        data: null,
      };
    } else {
      if (new Date(user.passwordRecoveryExpiration!) < new Date()) {
        return {
          status: ResultStatus.BadRequest,
          errorMessage: "Wrong recovery code!",
          extensions: [],
          data: null,
        };
      }

      const passwordHash = await this.bcryptService.generateHash(newPassword);
      await this.usersRepository.update(user._id.toString(), {
        ...user,
        password: passwordHash,
        passwordRecoveryCode: null,
        passwordRecoveryExpiration: null,
      });

      return {
        status: ResultStatus.Success,
        errorMessage: "",
        extensions: [],
        data: null,
      };
    }
  }
}
