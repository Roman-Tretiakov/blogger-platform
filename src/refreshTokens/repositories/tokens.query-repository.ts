import {
  whiteListTokensCollection,
  blackListTokensCollection,
} from "../../db/mongo.db";
import { WithId } from "mongodb";
import { WhiteListTokenMongoModel } from "../../auth/types/white-list-token-mongo-model";

export const tokensQueryRepository = {
  async isTokenWhitelisted(token: string, userId: string): Promise<boolean> {
    const tokenData: WithId<WhiteListTokenMongoModel> | null =
      await whiteListTokensCollection.findOne(
        { token, userId },
        { projection: { _id: 1 } },
      );
    return tokenData !== null;
  },

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenData = await blackListTokensCollection.findOne(
      {
        token,
      },
      { projection: { _id: 1 } },
    );
    return tokenData !== null;
  },
};
