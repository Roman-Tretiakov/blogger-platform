import { UserMongoModel } from "./type/user-mongo-model";
import { DomainError } from "../../core/errorClasses/DomainError";
import { injectable } from "inversify";
import { UserModel } from "./schemas/user.schema";

@injectable()
export class UsersRepository {
  async create(userData: UserMongoModel): Promise<string> {
    const newUser = await UserModel.create(userData);
    if (!newUser) {
      throw new DomainError("Failed to insert user");
    }
    return newUser._id.toString();
  }

  async delete(userId: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(userId);
    return result !== null;
  }

  async update(userId: string, userData: UserMongoModel): Promise<void> {
    const updateResult = await UserModel.findByIdAndUpdate(userId, {
      $set: userData,
    });
    if (!updateResult) {
      throw new DomainError(`No user found with id: ${userId}`);
    }
  }

  async clear(): Promise<void> {
    await UserModel.deleteMany({});
  }
}
