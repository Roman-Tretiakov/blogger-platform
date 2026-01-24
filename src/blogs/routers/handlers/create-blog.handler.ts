import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { BlogInputModel } from "../../dto/blog-input-dto";

export async function createBlogHandler (
  req: Request<{}, {}, BlogInputModel>,
  res: Response): Promise<void> {
  try {
    const newBlog = await blogsService.create(req.body);
    res.status(HttpStatus.Created).send(newBlog);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
