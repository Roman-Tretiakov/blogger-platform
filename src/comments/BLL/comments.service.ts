import { Result } from "../../core/types/result-object-type";
import { postsQueryRepository } from "../../posts/repositories/posts.query-repository";
import { ResultStatus } from "../../core/enums/result-statuses";
import { commentsRepository } from "../repositories/comments.repository";
import { CommentMongoModel } from "../repositories/types/comment-mongo-model";

export const commentsService = {
  async createCommentByPostId(
    postId: string,
    content: string,
    id: string,
    login: string,
  ): Promise<Result<string | null>> {
    try {
      await postsQueryRepository.getPostById(postId);
    } catch (e) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Post with specified postId doesn't exists",
        extensions: [],
        data: null,
      };
    }

    const comment: CommentMongoModel = {
      content: content,
      commentatorInfo: {
        userId: id,
        userLogin: login,
      },
      createdAt: new Date().toISOString(),
    };

    return await commentsRepository.create(comment);
  },
};
