import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { postsRepository } from "../../../posts/repositories/posts.repository";
import { UsersRepository } from "../../../users/repositories/users.repository";
import { commentsRepository } from "../../../comments/repositories/comments.repository";
import { authDevicesRepository } from "../../../securityDevices/repositories/authDevices.repository";

export const testingHandler = async (req: Request, res: Response) => {
  await postsRepository.clear();
  await blogsRepository.clear();
  await UsersRepository.clear();
  await commentsRepository.clear();
  await authDevicesRepository.clear();

  res.status(HttpStatus.NoContent).send("All data is deleted");
};
