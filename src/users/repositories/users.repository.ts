import { UserMongoModel } from "./type/user-mongo-model";
import { InsertOneResult, WithId } from "mongodb";
import { usersCollection } from "../../db/mongo.db";
import { DomainError } from "../../core/errorClasses/DomainError";

export const usersRepository = {
  async create(userData: UserMongoModel): Promise<WithId<UserMongoModel>> {
    const newUser: InsertOneResult<UserMongoModel> =
      await usersCollection.insertOne(userData);
    if (!newUser.acknowledged) {
      throw new DomainError("Failed to insert user");
    }
    return { ...userData, _id: newUser.insertedId };
  },

  async findByLoginOrEmail(
    loginOrEmail: string[],
  ): Promise<WithId<UserMongoModel> | null> {
    return usersCollection.findOne({
      $or: [{ login: { $in: loginOrEmail } }, { email: { $in: loginOrEmail } }],
    });
  },
};
