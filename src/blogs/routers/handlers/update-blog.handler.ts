import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { BlogInputModel } from "../../BLL/dto/blog-input-dto";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputModel>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    await blogsService.update(id, req.body);
    res.status(HttpStatus.NoContent).send();
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}