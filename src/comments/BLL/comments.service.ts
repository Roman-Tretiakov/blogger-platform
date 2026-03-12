import { Result } from "../../core/types/result-object-type";
import { PostsQueryRepository } from "../../posts/repositories/posts.query-repository";
import { ResultStatus } from "../../core/enums/result-statuses";
import { CommentsRepository } from "../repositories/comments.repository";
import { CommentMongoModel } from "../repositories/types/comment-mongo-model";
import { CommentsQueryRepository } from "../repositories/comments.query-repository";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";
import { inject, injectable } from "inversify";

@injectable()
export class CommentsService {
  constructor(
    @inject(CommentsRepository)
    private commentsRepository: CommentsRepository,
    @inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
    @inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async createCommentByPostId(
    postId: string,
    content: string,
    id: string,
    login: string,
  ): Promise<Result<string | null>> {
    try {
      await this.postsQueryRepository.getPostById(postId);
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

    return await this.commentsRepository.create(comment);
  }

  async updateCommentById(
    commentId: string,
    userId: string,
    content: CommentInputModel,
  ): Promise<Result> {
    let resultStatus: ResultStatus;
    let errMessage: string | null = null;

    const comment = await this.commentsQueryRepository.getById(commentId);
    if (comment.status === ResultStatus.Success) {
      if (comment.data!.commentatorInfo.userId === userId) {
        const updateResult = await this.commentsRepository.update(
          commentId,
          content,
        );
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
  }

  async deleteCommentById(commentId: string, userId: string): Promise<Result> {
    let resultStatus: ResultStatus;
    let errMessage: string | null = null;

    const comment = await this.commentsQueryRepository.getById(commentId);
    if (comment.status === ResultStatus.Success) {
      if (comment.data!.commentatorInfo.userId === userId) {
        const deleteResult = await this.commentsRepository.delete(commentId);
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
      data: null,
    };
  }
}
