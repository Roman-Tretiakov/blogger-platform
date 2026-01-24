import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { BlogInputModel } from "../../dto/blog-input-dto";

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputModel>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    await blogsService.update(id, req.body);
    res.status(HttpStatus.NoContent).send();
  } catch (e: any) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: "id", message: `${e.message}` }]));
  }
}