import { Request, Response } from "express";
import { CommentsService } from "../BLL/comments.service";
import { CommentsQueryRepository } from "../repositories/comments.query-repository";
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndBodyAndUserId,
} from "../../core/types/request-types";
import { ResultStatus } from "../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../core/utils/result-code-to-http-status.mapper";
import { HttpStatus } from "../../core/enums/http-status";
import { CommentInputModel } from "./inputTypes/comment-input-model";
import { inject, injectable } from "inversify";
import { LikeInputModel } from "./inputTypes/like-input-model";
import { IdType } from "../../core/types/id-type";
import { createErrorMessages } from "../../core/utils/error.utils";
import { mapToCommentViewModel } from "../mappers/map-to-comment-view-model";

@injectable()
export class CommentsController {
  constructor(
    @inject(CommentsService)
    private commentsService: CommentsService,
    @inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async delete(
    req: RequestWithParams<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const commentId = req.params.id;
    const userId = req.userData!.userId;
    const result = await this.commentsService.deleteCommentById(
      commentId,
      userId,
    );

    if (result.status !== ResultStatus.Success) {
      res.status(resultStatusToHttpStatusMapper(result.status)).send();
      return;
    }

    res.status(HttpStatus.NoContent).send();
  }

  async get(req: Request, res: Response): Promise<void> {
    const commentId = req.params.id;
    const result = await this.commentsQueryRepository.getById(
      commentId,
      req.userData?.userId,
    );

    if (result.status !== ResultStatus.Success) {
      res.status(resultStatusToHttpStatusMapper(result.status)).send();
      return;
    }

    const { comment, myStatus } = result.data!;
    res
      .status(resultStatusToHttpStatusMapper(result.status))
      .send(mapToCommentViewModel(comment, myStatus));
  }

  async update(
    req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>,
    res: Response,
  ): Promise<void> {
    const commentId = req.params.id;
    const userId = req.userData!.userId;
    const content = req.body;

    const result = await this.commentsService.updateCommentById(
      commentId,
      userId,
      content,
    );

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(createErrorMessages(result.extensions));
      return;
    }

    res.status(HttpStatus.NoContent).send();
  }

  async updateCommentWithReaction(
    req: RequestWithParamsAndBodyAndUserId<
      { id: string },
      LikeInputModel,
      IdType
    >,
    res: Response,
  ): Promise<void> {
    const commentId = req.params.id;
    const userId = req.userData!.userId;
    const status = req.body.likeStatus;

    const result = await this.commentsService.updateCommentByStatus(
      commentId,
      userId,
      status,
    );

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultStatusToHttpStatusMapper(result.status))
        .send(createErrorMessages(result.extensions));
      return;
    }

    res.status(HttpStatus.NoContent).send();
  }
}
