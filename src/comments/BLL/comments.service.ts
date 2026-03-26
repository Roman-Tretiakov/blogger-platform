import { Result } from "../../core/types/result-object-type";
import { PostsQueryRepository } from "../../posts/repositories/posts.query-repository";
import { ResultStatus } from "../../core/enums/result-statuses";
import { CommentsRepository } from "../repositories/comments.repository";
import { CommentMongoModel } from "../repositories/types/comment-mongo-model";
import { CommentsQueryRepository } from "../repositories/comments.query-repository";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";
import { inject, injectable } from "inversify";
import { LikesStatus } from "../enums/like-status";
import { CommentReactionQueryRepository } from "../../commentReaction/repositories/comment-reaction.query-repository";
import { CommentReactionRepository } from "../../commentReaction/repositories/comment-reaction.repository";

@injectable()
export class CommentsService {
  constructor(
    @inject(CommentReactionQueryRepository)
    private commentReactionQueryRepository: CommentReactionQueryRepository,
    @inject(CommentReactionRepository)
    private commentReactionRepository: CommentReactionRepository,
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
    const result = await this.commentsQueryRepository.getById(
      commentId,
      userId,
    );

    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: result.errorMessage,
        extensions: [],
        data: null,
      };
    }

    const { comment } = result.data!;

    if (comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: "Try to update the comment that is not your own",
        extensions: [],
        data: null,
      };
    }

    return await this.commentsRepository.update(commentId, content);
  }

  async deleteCommentById(commentId: string, userId: string): Promise<Result> {
    const result = await this.commentsQueryRepository.getById(
      commentId,
      userId,
    );

    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: result.errorMessage,
        extensions: [],
        data: null,
      };
    }

    const { comment } = result.data!;

    if (comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: "Try to delete the comment that is not your own",
        extensions: [],
        data: null,
      };
    }

    return await this.commentsRepository.delete(commentId);
  }

  async updateCommentByStatus(
    commentId: string,
    userId: string,
    newStatus: LikesStatus,
  ): Promise<Result> {
    // 1. Проверяем, существует ли комментарий
    const comment = await this.commentsQueryRepository.getById(
      commentId,
      userId,
    );
    if (comment.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Comment not found",
        extensions: [],
        data: null,
      };
    }

    // 2. Смотрим текущую реакцию пользователя
    const existingReaction =
      await this.commentReactionQueryRepository.findReaction(commentId, userId);

    const currentStatus = existingReaction?.status ?? LikesStatus.None;
    // 3. Если статус не изменился — ничего не делаем
    if (currentStatus === newStatus) {
      return {
        status: ResultStatus.Success,
        errorMessage: "",
        extensions: [],
        data: null,
      };
    }

    // 4. Вычисляем дельты счётчиков
    let likesIncrement = 0;
    let dislikesIncrement = 0;

    // Сначала "отменяем" старую реакцию
    if (currentStatus === LikesStatus.Like) likesIncrement--;
    if (currentStatus === LikesStatus.Dislike) dislikesIncrement--;

    // Затем "применяем" новую реакцию
    if (newStatus === LikesStatus.Like) likesIncrement++;
    if (newStatus === LikesStatus.Dislike) dislikesIncrement++;

    // 6. Сохраняем или удаляем реакцию пользователя
    if (newStatus === LikesStatus.None) {
      await this.commentReactionRepository.deleteReaction(commentId, userId);
    } else {
      await this.commentReactionRepository.upsertReaction(
        commentId,
        userId,
        newStatus,
      );
    }

    await this.commentsRepository.updateLikesCount(
      commentId,
      likesIncrement,
      dislikesIncrement,
    );

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: null,
    };
  }
}
