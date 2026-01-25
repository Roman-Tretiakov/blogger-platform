import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { BlogViewModel } from "../../BLL/dto/blog-view-model-type";

export async function getBlogListHandler (req: Request, res: Response): Promise<void> {
  try {
    const blogs: BlogViewModel[] = await blogsService.findAll();
    res.status(HttpStatus.Ok).send(blogs);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
