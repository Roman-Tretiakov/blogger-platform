import { Filter, WithId } from "mongodb";
import { UserMongoModel } from "./type/user-mongo-model";
import { UserListWithPagination } from "../routers/outputTypes/user-list-with-pagination";
import { UserQueryInput } from "../routers/inputTypes/user-query-input";
import { usersCollection } from "../../db/mongo.db";
import { mapToUserViewModel } from "../mappers/map-to-user-view-model";

export const usersQueryRepository = {
  async getUserById(): Promise<WithId<UserMongoModel> | null> {
    return null;
  },

  async getAllUsersWithPagination(
    queryParams: UserQueryInput,
  ): Promise<UserListWithPagination> {
    const skip = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const filter: Filter<UserMongoModel> = {};

    if (queryParams.searchLoginTerm) {
      filter.searchLoginTerm = queryParams.searchLoginTerm;
    }
    if (queryParams.searchEmailTerm) {
      filter.searchEmailTerm = queryParams.searchEmailTerm;
    }

    const items = await usersCollection
      .find(filter)
      .sort({ [queryParams.sortBy]: queryParams.sortDirection })
      .skip(skip)
      .limit(queryParams.pageSize)
      .toArray();
    const totalCount = await usersCollection.countDocuments(filter);

    return {
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      pagesCount: Math.ceil(totalCount / queryParams.pageSize),
      totalCount: totalCount,
      items: items.map(mapToUserViewModel)
    }
  },
};
