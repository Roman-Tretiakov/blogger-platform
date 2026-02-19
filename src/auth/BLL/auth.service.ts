import { usersQueryRepository } from "../../users/repositories/users.query-repository";
import { bcryptService } from "../adapters/bcrypt.service";
import { Result } from "../../core/types/result-object-type";
import { pairTokensViewModel } from "../routers/outputTypes/pair-tokens-view-model";
import { ResultStatus } from "../../core/enums/result-statuses";
import { jwtService } from "../adapters/jwt.service";
import { User } from "../../users/BLL/user-entity";
import { nodemailerService } from "../adapters/emailSendler/nodemailer.service";
import { MailServices } from "../adapters/enums/mail-services";
import { usersRepository } from "../../users/repositories/users.repository";
import { emailExamples } from "../adapters/emailSendler/emailExamples";
import { randomUUID } from "crypto";

export const authService = {
  async registerUser(
    login: string,
    email: string,
    password: string,
  ): Promise<Result> {
    const result = await this.checkLoginAndPassword([login, email], password);

    if (result) {
      const user = await usersQueryRepository.getUserById(result);
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

    const passwordHash = await bcryptService.generateHash(password);
    const newUser = new User(login, email, passwordHash);
    newUser.generateNewConfirmationCode().emailConfirmed(false);

    await usersRepository.create(newUser).catch((e) => {
      return {
        status: ResultStatus.Failure,
        errorMessage: "Something went wrong during user creation!",
        extensions: [],
        data: null,
      };
    });

    nodemailerService
      .sendEmail(
        MailServices.MAIL_RU,
        email,
        newUser.confirmationCode!,
        emailExamples.registrationEmail,
      )
      .catch((e) => {
        console.error("Failed to send confirmation email:", e);
      });

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  },

  async confirmEmail(code: string): Promise<Result> {
    const user = await usersQueryRepository.findUserByConfirmationCode(code);
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
      await usersRepository
        .update(user._id.toString(), {
          ...user,
        })
        .catch((e) => {
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
  },

  async resendEmail(email: string): Promise<Result> {
    const user = await usersQueryRepository.findByLoginOrEmail([email]);
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
    nodemailerService
      .sendEmail(
        MailServices.MAIL_RU,
        email,
        user.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((e) => {
        console.error("Failed to send confirmation email:", e);
      });

    await usersRepository.update(user._id.toString(), {
      ...user,
    });

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  },

  async loginUser(
    loginOrEmail: string,
    password: string,
    cookies: string,
  ): Promise<Result<pairTokensViewModel | null>> {
    const result = await this.checkLoginAndPassword([loginOrEmail], password);

    if (result) {
      const accessToken = jwtService.createToken(result);
      // TODO: refreshTokenService.createRefreshToken(refreshTokenType.UUID);
      const refreshToken = {
        value: "",
        cookieOptions: {
          domain: undefined,
          path: undefined,
          httpOnly: true,
          secure: true,
          sameSite: undefined,
          maxAge: 60000,
        },
      };

      return {
        status: ResultStatus.Success,
        errorMessage: "",
        extensions: [],
        data: { accessToken: accessToken, refreshToken: refreshToken },
      };
    }

    return {
      status: ResultStatus.Unauthorized,
      data: null,
      errorMessage: ResultStatus.Unauthorized,
      extensions: [{ field: "loginOrEmail", message: "Wrong credentials!" }],
    };
  },

  async checkLoginAndPassword(
    loginAndEmail: string[],
    password: string,
  ): Promise<string | null> {
    const user = await usersQueryRepository.findByLoginOrEmail(loginAndEmail);
    if (!user) {
      return null;
    }

    const isPasswordCorrect = await bcryptService.checkPassword(
      password,
      user!.password,
    );
    if (!isPasswordCorrect) {
      return null;
    }

    return user._id.toString();
  },
};
