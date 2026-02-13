import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { BlogViewModel } from "../../BLL/dto/blog-view-model-type";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { blogsQueryRepository } from "../../repositories/blogs.query-repository";

export async function getBlogHandler(
  req: Request,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    const blog: BlogViewModel = await blogsQueryRepository.getBlogById(id);
    return res.status(HttpStatus.Ok).send(blog);
  } catch (e: unknown) {
    return errorsHandler(e, res);
  }
}
