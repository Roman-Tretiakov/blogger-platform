import { ObjectId, WithId } from "mongodb";
import { UserMongoModel } from "./type/user-mongo-model";
import { UserListWithPagination } from "../routers/outputTypes/user-list-with-pagination";
import { UserQueryInput } from "../routers/inputTypes/user-query-input";
import { mapToUserViewModel } from "../mappers/map-to-user-view-model";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { UserViewModel } from "../types/outputTypes/user-view-model";
import { MeViewModel } from "../../auth/routers/outputTypes/me-view-model";
import { injectable } from "inversify";
import { LeanUser, UserModel } from "./schemas/user.schema";

@injectable()
export class UsersQueryRepository {
  async getUserById(id: string): Promise<UserViewModel> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundError(`User with id: ${id} not found`, "id");
    }

    const user = await UserModel.findById(id).lean<LeanUser>();
    if (user === null) {
      throw new NotFoundError(`User with id: ${id} not found`, "id");
    }
    return mapToUserViewModel(user);
  }

  async findByLoginOrEmail(loginOrEmail: string[]): Promise<LeanUser | null> {
    return UserModel.findOne({
      $or: [{ login: { $in: loginOrEmail } }, { email: { $in: loginOrEmail } }],
    }).lean<LeanUser>();
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<WithId<UserMongoModel> | null> {
    return UserModel.findOne({
      "emailConfirmation.confirmationCode": code,
    }).lean<LeanUser>();
  }

  async findUserByPasswordRecoveryCode(
    code: string,
  ): Promise<WithId<UserMongoModel> | null> {
    return UserModel.findOne({
      "passwordRecovery.recoveryCode": code,
    }).lean<LeanUser>();
  }

  async getAllUsersWithPagination(
    queryParams: UserQueryInput,
  ): Promise<UserListWithPagination> {
    const skip = (queryParams.pageNumber - 1) * queryParams.pageSize;

    // Создаем фильтр с логикой OR
    const filter: Record<string, any> = {};
    const conditions = [];

    if (queryParams.searchLoginTerm) {
      conditions.push({
        login: {
          $regex: queryParams.searchLoginTerm,
          $options: "i",
        },
      });
    }

    if (queryParams.searchEmailTerm) {
      conditions.push({
        email: {
          $regex: queryParams.searchEmailTerm,
          $options: "i",
        },
      });
    }

    // Если есть хотя бы одно условие поиска, используем $or
    if (conditions.length > 0) {
      filter.$or = conditions;
    }

    const items = await UserModel.find(filter) // Используем единый фильтр
      .sort({
        [queryParams.sortBy]: queryParams.sortDirection === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(queryParams.pageSize)
      .lean();

    const totalCount = await UserModel.countDocuments(filter);

    return {
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      pagesCount: Math.ceil(totalCount / queryParams.pageSize),
      totalCount: totalCount,
      items: items.map(mapToUserViewModel),
    };
  }

  async getMe(userId: string): Promise<MeViewModel> {
    const user = await this.getUserById(userId);
    return {
      login: user.login,
      email: user.email,
      userId: user.id,
    };
  }
}
