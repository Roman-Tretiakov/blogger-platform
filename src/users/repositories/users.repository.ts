import { UserMongoModel } from "./type/user-mongo-model";
import { DeleteResult, ObjectId } from "mongodb";
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

  async delete(userId: string): Promise<DeleteResult> {
    return UserModel.deleteOne({ _id: new ObjectId(userId) });
  }

  async update(userId: string, userData: UserMongoModel): Promise<void> {
    const updateResult = await UserModel.updateOne(
      { _id: new ObjectId(userId) },
      { $set: userData },
    );
    if (updateResult.matchedCount === 0) {
      throw new DomainError(`No user found with id: ${userId}`);
    }
  }

  async clear(): Promise<void> {
    await UserModel.deleteMany({});
  }
}
