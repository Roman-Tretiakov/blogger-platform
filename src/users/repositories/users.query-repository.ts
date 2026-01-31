import { WithId } from "mongodb";
import { UserMongoModel } from "./type/user-mongo-model";

export const usersQueryRepository = {
  async getUserById(): Promise<WithId<UserMongoModel> | null> {
    return null;
  },

};
