import { UserViewModel } from "../types/outputTypes/user-view-model";
import { LeanUser } from "../repositories/schemas/user.schema";

export function mapToUserViewModel(user: LeanUser): UserViewModel {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  };
}
