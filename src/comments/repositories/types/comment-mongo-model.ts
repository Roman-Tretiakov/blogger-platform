export type CommentMongoModel = {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
};