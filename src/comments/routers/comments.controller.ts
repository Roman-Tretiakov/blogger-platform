import { Response } from "express";
import { CommentsService } from "../BLL/comments.service";
import { CommentsQueryRepository } from "../repositories/comments.query-repository";
import {
  RequestWithParams,
  RequestWithParamsAndBody,
} from "../../core/types/request-types";
import { ResultStatus } from "../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../core/utils/result-code-to-http-status.mapper";
import { HttpStatus } from "../../core/enums/http-status";
import { CommentInputModel } from "./inputTypes/comment-input-model";

export class CommentsController {
  constructor(
    private commentsService: CommentsService,
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

  async get(
    req: RequestWithParams<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const commentId = req.params.id;
    const result = await this.commentsQueryRepository.getById(commentId);

    if (result.status !== ResultStatus.Success) {
      res.status(resultStatusToHttpStatusMapper(result.status)).send();
      return;
    }

    res.status(resultStatusToHttpStatusMapper(result.status)).send(result.data);
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
      res.status(resultStatusToHttpStatusMapper(result.status)).send();
      return;
    }

    res.status(HttpStatus.NoContent).send();
  }
}
