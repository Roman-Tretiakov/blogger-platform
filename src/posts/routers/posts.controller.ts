import { Request, Response } from "express";
import { PostsService } from "../BLL/posts.service";
import { PostsQueryRepository } from "../repositories/posts.query-repository";
import {
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
} from "../../core/types/request-types";
import { CommentInputModel } from "../../comments/routers/inputTypes/comment-input-model";
import { UsersQueryRepository } from "../../users/repositories/users.query-repository";
import { CommentsService } from "../../comments/BLL/comments.service";
import { ResultStatus } from "../../core/enums/result-statuses";
import { resultStatusToHttpStatusMapper } from "../../core/utils/result-code-to-http-status.mapper";
import { CommentsQueryRepository } from "../../comments/repositories/comments.query-repository";
import { HttpStatus } from "../../core/enums/http-status";
import { BlogPostInputModel, PostInputModel } from "../BLL/dto/post-input-dto";
import { errorsHandler } from "../../core/utils/errors-hundler";
import { CommentsQueryInput } from "../../comments/routers/inputTypes/comments-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../core/utils/sort-and-pagination.utils";
import { PostQueryInput } from "./inputTypes/post-query-input";

export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async createCommentByPost(
    req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>,
    res: Response,
  ): Promise<void> {
    const postId = req.params.id;
    const content = req.body.content;
    const userId = req.userData!.userId;
    const userLogin = await this.usersQueryRepository
      .getMe(userId)
      .then((u) => u.login);

    const postResult = await this.commentsService.createCommentByPostId(
      postId,
      content,
      userId,
      userLogin,
    );
    if (postResult.status !== ResultStatus.Created) {
      res
        .status(resultStatusToHttpStatusMapper(postResult.status))
        .send(postResult.errorMessage);
      return;
    }

    const commentResult = await this.commentsQueryRepository.getById(
      postResult.data!,
    );
    if (commentResult.status !== ResultStatus.Success) {
      res.status(HttpStatus.NotFound).send(postResult.errorMessage);
      return;
    }

    res.status(HttpStatus.Created).send(commentResult.data);
  }

  async createPost(
    req: Request<{}, {}, PostInputModel>,
    res: Response,
  ): Promise<void> {
    try {
      const inputData = req.body;
      const createdPostId = await this.postsService.create(inputData);
      const createdPost =
        await this.postsQueryRepository.getPostById(createdPostId);

      res.status(HttpStatus.Created).send(createdPost);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async createPostByBlog(
    req: Request<{ id: string }, {}, BlogPostInputModel>,
    res: Response,
  ): Promise<void> {
    try {
      const blogId = req.params.id;
      const inputData = req.body;
      const createdPostId = await this.postsService.create(inputData, blogId);
      const createdPost =
        await this.postsQueryRepository.getPostById(createdPostId);

      res.status(HttpStatus.Created).send(createdPost);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id;
    try {
      await this.postsService.deleteById(id);
      res
        .status(HttpStatus.NoContent)
        .send(`Post with id: ${id} was deleted successfully.`);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async getCommentsByPostList(
    req: RequestWithParamsAndQuery<{ id: string }, CommentsQueryInput>,
    res: Response,
  ): Promise<void> {
    const postId = req.params.id;
    const sanitizedQuery = matchedData<CommentsQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });
    const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

    try {
      await this.postsQueryRepository.getPostById(postId);
    } catch (e) {
      res
        .status(HttpStatus.NotFound)
        .send("post for passed postId doesn't exist");
      return;
    }

    const result = await this.commentsQueryRepository.getCommentsByPost(
      postId,
      queryInput,
    );
    res.status(resultStatusToHttpStatusMapper(result.status)).send(result.data);
  }

  async get(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const post = await this.postsQueryRepository.getPostById(id);
      res.status(HttpStatus.Ok).send(post);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async getList(
    req: Request<{}, {}, {}, PostQueryInput>,
    res: Response,
  ): Promise<void> {
    try {
      const sanitizedQuery = matchedData<PostQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });
      const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
      const postList = await this.postsQueryRepository.findMany(queryInput);

      res.status(HttpStatus.Ok).send(postList);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async getListByBlog(
    req: Request<{ id: string }, {}, {}, PostQueryInput>,
    res: Response,
  ): Promise<void> {
    try {
      const blogId: string = req.params.id;
      const sanitizedQuery = matchedData<PostQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });
      const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
      const postList = await this.postsQueryRepository.findMany(
        queryInput,
        blogId,
      );

      res.status(HttpStatus.Ok).send(postList);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async update(
    req: Request<{ id: string }, {}, PostInputModel>,
    res: Response,
  ) {
    const id: string = req.params.id;
    try {
      await this.postsService.update(id, req.body);
      res.status(HttpStatus.NoContent).send();
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }
}
