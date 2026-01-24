import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { BlogViewModel } from "../../domainType/blog-view-model-type";
import { createErrorMessages } from "../../../core/utils/error.utils";

export async function getBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    const blog: BlogViewModel | null = await blogsService.findById(id);
    res.status(HttpStatus.Ok).send(blog);
  } catch (e: any) {
    res
      .status(HttpStatus.NotFound)
      .send(
        createErrorMessages([
          { field: "id", message: `${e.message}` },
        ]),
      );
  }
}
