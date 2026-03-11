import { UserMongoModel } from "./type/user-mongo-model";
import { Collection, DeleteResult, InsertOneResult, ObjectId } from "mongodb";
import { DomainError } from "../../core/errorClasses/DomainError";

export class UsersRepository {
  constructor(private collection: Collection<UserMongoModel>) {}

  async create(userData: UserMongoModel): Promise<string> {
    const newUser: InsertOneResult<UserMongoModel> =
      await this.collection.insertOne(userData);
    if (!newUser.acknowledged) {
      throw new DomainError("Failed to insert user");
    }
    return newUser.insertedId.toString();
  }

  async delete(userId: string): Promise<DeleteResult> {
    return await this.collection.deleteOne({ _id: new ObjectId(userId) });
  }

  async update(userId: string, userData: UserMongoModel): Promise<void> {
    const updateResult = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: userData },
    );
    if (updateResult.matchedCount === 0) {
      throw new DomainError(`No user found with id: ${userId}`);
    }
  }

  async clear(): Promise<void> {
    await this.collection.drop();
  }
}
