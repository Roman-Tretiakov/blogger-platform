import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { postsRepository } from "../../../posts/repositories/posts.repository";
import { usersRepository } from "../../../users/repositories/users.repository";
import { commentsRepository } from "../../../comments/repositories/comments.repository";
import { tokensRepository } from "../../../refreshTokens/repositories/tokens.repository";

export const testingHandler = async (req: Request, res: Response) => {
  await postsRepository.clear();
  await blogsRepository.clear();
  await usersRepository.clear();
  await commentsRepository.clear();
  await tokensRepository.clear();

  res.status(HttpStatus.NoContent).send("All data is deleted");
};
