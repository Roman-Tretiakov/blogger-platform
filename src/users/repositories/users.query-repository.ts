import { Filter, ObjectId, WithId } from "mongodb";
import { UserMongoModel } from "./type/user-mongo-model";
import { UserListWithPagination } from "../routers/outputTypes/user-list-with-pagination";
import { UserQueryInput } from "../routers/inputTypes/user-query-input";
import { usersCollection } from "../../db/mongo.db";
import { mapToUserViewModel } from "../mappers/map-to-user-view-model";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { UserViewModel } from "../types/outputTypes/user-view-model";

export const usersQueryRepository = {
  async getUserById(id: string): Promise<UserViewModel> {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (user === null) {
      throw new NotFoundError(`User with id: ${id} not found`, "id");
    }
    return mapToUserViewModel(user);
  },

  async findByLoginOrEmail(
    loginOrEmail: string[],
  ): Promise<WithId<UserMongoModel> | null> {
    return usersCollection.findOne({
      $or: [{ login: { $in: loginOrEmail } }, { email: { $in: loginOrEmail } }],
    });
  },

  async getAllUsersWithPagination(
    queryParams: UserQueryInput,
  ): Promise<UserListWithPagination> {
    const skip = (queryParams.pageNumber - 1) * queryParams.pageSize;

    // Создаем фильтр с логикой OR
    const filter: Filter<UserMongoModel> = {};
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

    const items = await usersCollection
      .find(filter)  // Используем единый фильтр
      .sort({ [queryParams.sortBy]: queryParams.sortDirection === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(queryParams.pageSize)
      .toArray();

    const totalCount = await usersCollection.countDocuments(filter);

    return {
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      pagesCount: Math.ceil(totalCount / queryParams.pageSize),
      totalCount: totalCount,
      items: items.map(mapToUserViewModel),
    };
  }
};
