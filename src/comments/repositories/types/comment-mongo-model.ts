import { LikesInfoViewModel } from "./likes-info-view-model";

export type CommentMongoModel = {
  content: string;
  postId: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModel;
};
