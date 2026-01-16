import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";

export const getBlogListHandler = async (req: Request, res: Response) => {
  const blogs = await blogsRepository.findAll();
  res.status(HttpStatus.Ok).send(blogs);
};
