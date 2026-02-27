import { whiteListTokensCollection } from "../../db/mongo.db";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { RefreshTokenViewModel } from "../../auth/routers/outputTypes/refresh-token-view-model";
import { mapToRefreshTokenViewModel } from "../../auth/mappers/map-to-refresh-token-view-model";

export const tokensQueryRepository = {
  async getValidTokenDetails(
    token: string,
    userId: string,
  ): Promise<Result<RefreshTokenViewModel | null>> {
    const tokenData = await whiteListTokensCollection.findOne(
      { token, userId },
      { projection: { _id: 1 } },
    );

    return {
      status: tokenData ? ResultStatus.Success : ResultStatus.Unauthorized,
      errorMessage: "",
      extensions: [],
      data: tokenData ? mapToRefreshTokenViewModel(tokenData) : null,
    };
  },
};
