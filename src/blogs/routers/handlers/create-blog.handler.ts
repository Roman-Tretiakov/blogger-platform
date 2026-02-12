import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { BlogInputModel } from "../../BLL/dto/blog-input-dto";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { blogsQueryRepository } from "../../repositories/blogs.query-repository";

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputModel>,
  res: Response,
): Promise<void> {
  try {
    const inputData = req.body;
    const createdBlogId: string = await blogsService.create(inputData);
    const createdBlog = await blogsQueryRepository.getBlogById(createdBlogId);

    res.status(HttpStatus.Created).send(createdBlog);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
