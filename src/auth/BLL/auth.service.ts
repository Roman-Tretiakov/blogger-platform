import { usersQueryRepository } from "../../users/repositories/users.query-repository";
import { bcryptService } from "../adapters/bcrypt.service";
import { Result } from "../../core/types/result-object-type";
import { accessTokenViewModel } from "../routers/outputTypes/access-token-view-model";
import { WithId } from "mongodb";
import { UserMongoModel } from "../../users/repositories/type/user-mongo-model";
import { ResultStatus } from "../../core/enums/result-statuses";
import { jwtService } from "../adapters/jwt.service";

export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<accessTokenViewModel | null>> {
    const result = await this.checkLoginAndPassword(loginOrEmail, password);

    if (result.status === ResultStatus.Success) {
      const token = jwtService.createToken(result.data!._id.toString());
      return {
        ...result,
        data: { accessToken: token },
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
    str: string,
    password: string,
  ): Promise<Result<WithId<UserMongoModel> | null>> {
    const loginOrEmail: string[] = [str];

    const user = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: "No user found with such login or email",
        extensions: [],
      };
    }

    const isPasswordCorrect = await bcryptService.checkPassword(
      password,
      user!.password,
    );
    if (!isPasswordCorrect) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: "Password is wrong",
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },
};
