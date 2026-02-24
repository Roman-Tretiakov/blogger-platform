import {
  blackListTokensCollection,
  whiteListTokensCollection,
} from "../../db/mongo.db";
import { WithId } from "mongodb";
import { WhiteListTokenMongoModel } from "../../auth/types/white-list-token-mongo-model";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";

export const tokensQueryRepository = {
  async isTokenWhitelistedAndValid(
    token: string,
    userId: string,
  ): Promise<Result<string | null>> {
    const currentDate = new Date();
    const tokenData: WithId<WhiteListTokenMongoModel> | null =
      await whiteListTokensCollection.findOne(
        {
          token,
          userId,
          expiresAt: { $gt: currentDate },
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
};
