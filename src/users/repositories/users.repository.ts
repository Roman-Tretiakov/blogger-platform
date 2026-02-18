import { UserMongoModel } from "./type/user-mongo-model";
import { DeleteResult, InsertOneResult, ObjectId } from "mongodb";
import { usersCollection } from "../../db/mongo.db";
import { DomainError } from "../../core/errorClasses/DomainError";

export const usersRepository = {
  async create(userData: UserMongoModel): Promise<string> {
    const newUser: InsertOneResult<UserMongoModel> =
      await usersCollection.insertOne(userData);
    if (!newUser.acknowledged) {
      throw new DomainError("Failed to insert user");
    }
    return newUser.insertedId.toString();
  },

  async delete(userId: string): Promise<DeleteResult> {
    return await usersCollection.deleteOne({ _id: new ObjectId(userId) });
  },

  async update(userId: string, userData: UserMongoModel): Promise<void> {
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: userData },
    );
    if (updateResult.matchedCount === 0) {
      throw new DomainError(`No user found with id: ${userId}`);
    }
  },

  async clear(): Promise<void> {
    await usersCollection.drop();
  },
};
