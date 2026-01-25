import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { BlogViewModel } from "../../BLL/dto/blog-view-model-type";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function getBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    const blog: BlogViewModel | null = await blogsService.findById(id);
    res.status(HttpStatus.Ok).send(blog);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
