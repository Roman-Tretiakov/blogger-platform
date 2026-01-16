import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { BlogViewModel } from "../../../core/types/blog-view-model-type";

export const getBlogHandler = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const blog: BlogViewModel | null = await blogsRepository.findById(id);
  if (!blog) {
    return res.status(HttpStatus.NotFound).send(`No blog found by id: ${id}.`);
  }
  res.status(HttpStatus.Ok).send(blog);
};
