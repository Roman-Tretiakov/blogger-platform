import { WithId } from "mongodb";
import { UserViewModel } from "../types/outputTypes/user-view-model";
import { UserMongoModel } from "../repositories/type/user-mongo-model";

export function mapToUserViewModel(user: WithId<UserMongoModel>): UserViewModel{
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  }
}