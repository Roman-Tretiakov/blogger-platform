import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { mapToCommentViewModel } from "../mappers/map-to-comment-view-model";
import { CommentListWithPagination } from "../routers/outputTypes/comment-list-with-pagination";
import { CommentsQueryInput } from "../routers/inputTypes/comments-query-input";
import { inject, injectable } from "inversify";
import { CommentModel, LeanComment } from "./schemas/comment.schema";
import { CommentReactionQueryRepository } from "../../commentReaction/repositories/comment-reaction.query-repository";
import { CommentWithStatus } from "./types/comment-with-status";

@injectable()
export class CommentsQueryRepository {
  constructor(
    @inject(CommentReactionQueryRepository)
    private reactionsQueryRepository: CommentReactionQueryRepository,
  ) {}
  async getById(
    commentId: string,
    userId?: string,
  ): Promise<Result<CommentWithStatus | null>> {
    const comment = await CommentModel.findById(commentId).lean<LeanComment>();
    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Comment not found",
        extensions: [
          {
            field: "commentId",
            message: "Comment not found by this id",
          },
        ],
        data: null,
      };
    }

    const myStatus = await this.reactionsQueryRepository.getUserStatus(
      commentId,
      userId,
    );

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: {
        comment,
        myStatus,
      },
    };
  }

  async getCommentsByPost(
    postId: string,
    queryInput: CommentsQueryInput,
    userId?: string,
  ): Promise<Result<CommentListWithPagination | null>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: Record<string, any> = {};

    filter.postId = postId;

    const items = await CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean<LeanComment[]>();

    const totalCount = await CommentModel.countDocuments(filter);

    // Для каждого комментария получаем myStatus текущего пользователя
    // Promise.all — запускаем все запросы параллельно, не последовательно
    const itemsWithStatuses = await Promise.all(
      items.map(async (comment) => {
        const myStatus = await this.reactionsQueryRepository.getUserStatus(
          comment._id.toString(),
          userId ?? undefined,
        );
        return mapToCommentViewModel(comment, myStatus);
      }),
    );

    const commentList = {
      page: pageNumber,
      pageSize: pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: itemsWithStatuses,
    };

    return {
      status: ResultStatus.Success,
      errorMessage: "",
      extensions: [],
      data: commentList,
    };
  }
}
