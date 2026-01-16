import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostViewModel } from "../../../core/types/post-view-model-type";

export const getPostHandler = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const post: PostViewModel | null = await postsRepository.findById(id);
  if (!post) {
    return res.status(HttpStatus.NotFound).send(`No post found by id: ${id}.`);
  }
  res.status(HttpStatus.Ok).send(post);
};
