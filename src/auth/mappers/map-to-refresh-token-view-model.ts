import { WhiteListTokenMongoModel } from "../types/white-list-token-mongo-model";
import { RefreshTokenViewModel } from "../routers/outputTypes/refresh-token-view-model";
import { WithId } from "mongodb";

export function mapToRefreshTokenViewModel(
  token: WithId<WhiteListTokenMongoModel>,
): RefreshTokenViewModel {
  return {
    id: token._id.toString(),
    token: token.token,
    userId: token.userId,
    expiresAt: token.expiresAt,
  };
}
