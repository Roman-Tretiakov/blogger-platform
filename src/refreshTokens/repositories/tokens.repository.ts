import {
  whiteListTokensCollection,
  blackListTokensCollection,
} from "../../db/mongo.db";
import { WhiteListTokenMongoModel } from "../../auth/types/white-list-token-mongo-model";
import { appConfig } from "../../core/config/appConfig";
import { ObjectId } from "mongodb";
import { TokenMongoType } from "../types/token-mongo-type";

export const tokensRepository = {
  async addTokenToWhitelist(
    token: string,
    userId: string,
  ): Promise<string | null> {
    const tokenData: WhiteListTokenMongoModel = {
      token: token,
      userId: userId,
      expiresAt: new Date(Date.now() + appConfig.RT_TOKEN_TIME * 1000), // Устанавливаем время истечения токена на основе текущего времени и времени жизни RT из конфигурации
    };

    const result = await whiteListTokensCollection.insertOne(tokenData);
    if (!result.acknowledged) {
      return null;
    }

    console.log(`Token added to whitelist: ${token} for userId: ${userId}`);
    return result.insertedId.toString();
  },

  async addTokenToBlackList(token: string): Promise<string | null> {
    const result = await blackListTokensCollection.insertOne({ token: token });

    if (!result.acknowledged) {
      return null;
    }
    console.log(`Token added to blacklist: ${token}`);
    return result.insertedId.toString();
  },

  async removeToken(tokenId: string, type: TokenMongoType): Promise<number> {
    const collection =
      type === TokenMongoType.WhiteListToken
        ? whiteListTokensCollection
        : blackListTokensCollection;

    const result = await collection.deleteOne({
      _id: new ObjectId(tokenId),
    });

    return result.deletedCount;
  },

  async clear(): Promise<void> {
    await whiteListTokensCollection.drop();
    await blackListTokensCollection.drop();
  },
};
