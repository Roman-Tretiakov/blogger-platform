import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { BlogViewModel } from "../../../types/blog-view-model-type";

export const getBlogHandler = (req: Request, res: Response) => {
  const id: string = req.params.id;
  const blog: BlogViewModel | null = blogsRepository.findById(id);
  if (!blog) {
    return res.status(HttpStatus.NotFound).send(`No blog found by id: ${id}.`);
  }
  res.status(HttpStatus.Ok).send(blog);
};
