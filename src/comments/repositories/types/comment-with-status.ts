import { LeanComment } from "../schemas/comment.schema";
import { LikesStatus } from "../../enums/like-status";

export type CommentWithStatus = {
  comment: LeanComment;
  myStatus: LikesStatus;
};
