import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { BlogViewModel } from "../../../core/types/blog-view-model-type";

export const postBlogHandler = async (req: Request, res: Response) => {
  const newBlog: BlogViewModel = await blogsRepository.create(req.body);
  res.status(HttpStatus.Created).send(newBlog);
};
