import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { BlogViewModel } from "../../../types/blog-view-model-type";

export const postBlogHandler = (req: Request, res: Response) => {
  const newBlog: BlogViewModel = blogsRepository.create(req.body);
  res.status(HttpStatus.Created).send(newBlog);
};
