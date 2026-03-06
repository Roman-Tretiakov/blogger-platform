import { PairTokensViewModel } from "../routers/outputTypes/pair-tokens-view-model";

export type UserIdModel = {
  userId: string;
} & Partial<PairTokensViewModel>;
