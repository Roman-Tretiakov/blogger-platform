import {
  blackListTokensCollection,
  whiteListTokensCollection,
} from "../../db/mongo.db";
import { ObjectId, WithId } from "mongodb";
import { WhiteListTokenMongoModel } from "../../auth/types/white-list-token-mongo-model";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";

export const tokensQueryRepository = {
  async isTokenWhitelisted(
    token: string,
    userId: string,
  ): Promise<Result<string | null>> {
    const tokenData: WithId<WhiteListTokenMongoModel> | null =
      await whiteListTokensCollection.findOne(
        {
          token,
          userId,
        },
        { projection: { _id: 1 } },
      );
    const result = tokenData?._id.toString() ?? null;

    return {
      status: result ? ResultStatus.Success : ResultStatus.Unauthorized,
      errorMessage: "",
      extensions: [],
      data: result,
    };
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

  async isWhiteListTokenExpires(tokenId: string): Promise<boolean> {
    const currentDate = new Date();
    const token = await whiteListTokensCollection.findOne({
      _id: new ObjectId(tokenId),
    });

    if (!token) return true;
    return token.expiresAt < currentDate;
  },
};
