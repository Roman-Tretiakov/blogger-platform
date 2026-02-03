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

    let createdBlog = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts && createdBlog === null) {
      attempts++;
      try {
        createdBlog = await blogsQueryRepository.getBlogById(createdBlogId)
      } catch (e) {
        if (attempts === maxAttempts) {
          console.log("2nd attempt to get blog by id failed");
          throw e;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    res.status(HttpStatus.Created).send(createdBlog);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
