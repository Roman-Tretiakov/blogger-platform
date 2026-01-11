import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostViewModel } from "../../../types/post-view-model-type";

export const getPostHandler = (req: Request, res: Response) => {
  const id: string = req.params.id;
  const post: PostViewModel | null = postsRepository.findById(id);
  if (!post) {
    return res.status(HttpStatus.NotFound).send(`No post found by id: ${id}.`);
  }
  res.status(HttpStatus.Ok).send(post);
};
