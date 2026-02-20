import {
  whiteListTokensCollection,
  blackListTokensCollection,
} from "../../db/mongo.db";
import { WhiteListTokenMongoModel } from "../../auth/types/white-list-token-mongo-model";
import { appConfig } from "../../core/config/appConfig";

export const tokensRepository = {
  async addTokenToWhitelist(token: string, userId: string): Promise<string> {
    const tokenData: WhiteListTokenMongoModel = {
      token: token,
      userId: userId,
      expiresAt: new Date(Date.now() + appConfig.RT_TOKEN_TIME * 1000), // Устанавливаем время истечения токена на основе текущего времени и времени жизни RT из конфигурации
    };

    const result = await whiteListTokensCollection.insertOne(tokenData);
    if (!result.acknowledged) {
      throw new Error("Failed to add token to whitelist");
    }

    console.log(`Token added to whitelist: ${token} for userId: ${userId}`);
    return result.insertedId.toString();
  },

  async addTokenToBlackList(token: string): Promise<void> {
    const result = await blackListTokensCollection.insertOne({ token: token });

    if (!result.acknowledged) {
      throw new Error("Failed to add token to blacklist");
    }
    console.log(`Token added to blacklist: ${token}`);
  },
};
