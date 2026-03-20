import { LikesStatus } from "../../enums/like-status";

export type LikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikesStatus;
};
