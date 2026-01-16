import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { postsRepository } from "../../../posts/repositories/posts.repository";

export const testingHandler = (req: Request, res: Response) => {
  postsRepository.clear().then();
  blogsRepository.clear().then();
  res.status(HttpStatus.NoContent).send("All data is deleted");
};
