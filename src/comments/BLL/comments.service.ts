import { Result } from "../../core/types/result-object-type";
import { postsQueryRepository } from "../../posts/repositories/posts.query-repository";
import { ResultStatus } from "../../core/enums/result-statuses";
import { commentsRepository } from "../repositories/comments.repository";
import { CommentMongoModel } from "../repositories/types/comment-mongo-model";
import { commentsQueryRepository } from "../repositories/comments.query-repository";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";

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
      postId: postId,
      commentatorInfo: {
        userId: id,
        userLogin: login,
      },
      createdAt: new Date().toISOString(),
    };

    return await commentsRepository.create(comment);
  },

  async updateCommentById(
    commentId: string,
    userId: string,
    content: CommentInputModel
  ): Promise<Result>{
    let resultStatus: ResultStatus;
    let errMessage: string | null = null;

    const comment = await commentsQueryRepository.getById(commentId);
    if (comment.status === ResultStatus.Success) {
      if (comment.data!.commentatorInfo.userId === userId) {
        const updateResult = await commentsRepository.update(commentId, content);
        resultStatus = updateResult.status;
      } else {
        resultStatus = ResultStatus.Forbidden;
        errMessage = "Try to update the comment that is not your own";
      }
    } else resultStatus = ResultStatus.NotFound;

    return {
      status: resultStatus,
      errorMessage: errMessage ?? comment.errorMessage,
      extensions: [],
      data: null,
    };
  },

  async deleteCommentById(commentId: string, userId: string): Promise<Result> {
    let resultStatus: ResultStatus;
    let errMessage: string | null = null;

    const comment = await commentsQueryRepository.getById(commentId);
    if (comment.status === ResultStatus.Success) {
      if (comment.data!.commentatorInfo.userId === userId) {
        const deleteResult = await commentsRepository.delete(commentId);
        resultStatus = deleteResult.status;
      } else {
        resultStatus = ResultStatus.Forbidden;
        errMessage = "Try to delete the comment that is not your own";
      }
    } else resultStatus = ResultStatus.NotFound;

    return {
      status: resultStatus,
      errorMessage: errMessage ?? comment.errorMessage,
      extensions: [],
      data: null
    }
  },
};
