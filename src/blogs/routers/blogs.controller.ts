import { Request, Response } from "express";
import { BlogsQueryRepository } from "../repositories/blogs.query-repository";
import { BlogsService } from "../BLL/blogs.service";
import { BlogInputModel } from "../BLL/dto/blog-input-dto";
import { HttpStatus } from "../../core/enums/http-status";
import { errorsHandler } from "../../core/utils/errors-hundler";
import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import { BlogQueryInput } from "./inputTypes/blog-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../core/utils/sort-and-pagination.utils";
import { inject } from "inversify";

export class BlogsController {
  constructor(
    @inject(BlogsService)
    private blogsService: BlogsService,
    @inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async create(
    req: Request<{}, {}, BlogInputModel>,
    res: Response,
  ): Promise<void> {
    try {
      const inputData = req.body;
      const createdBlogId: string = await this.blogsService.create(inputData);
      const createdBlog =
        await this.blogsQueryRepository.getBlogById(createdBlogId);

      res.status(HttpStatus.Created).send(createdBlog);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async delete(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      await this.blogsService.delete(id);
      res
        .status(HttpStatus.NoContent)
        .send(`Blog with id: ${id} was deleted successfully.`);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async get(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const blog: BlogViewModel =
        await this.blogsQueryRepository.getBlogById(id);
      return res.status(HttpStatus.Ok).send(blog);
    } catch (e: unknown) {
      return errorsHandler(e, res);
    }
  }

  async getList(
    req: Request<{}, {}, {}, BlogQueryInput>,
    res: Response,
  ): Promise<void> {
    try {
      const sanitizedQuery = matchedData<BlogQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });
      const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
      const blogList = await this.blogsQueryRepository.findMany(queryInput);

      res.status(HttpStatus.Ok).send(blogList);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async update(
    req: Request<{ id: string }, {}, BlogInputModel>,
    res: Response,
  ) {
    const id: string = req.params.id;
    try {
      await this.blogsService.update(id, req.body);
      res.status(HttpStatus.NoContent).send();
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }
}
