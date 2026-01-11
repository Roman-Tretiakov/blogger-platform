import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { createErrorMessages } from "../../../utils/error.utils";
import { postsRepository } from "../../repositories/posts.repository";
import { PostViewModel } from "../../../types/post-model-type";

export const getPostHandler = (req: Request, res: Response) => {
  const id: string = req.params.id;
  const post: PostViewModel | null = postsRepository.findById(id);
  if (!post) {
    return res.status(HttpStatus.NotFound).send(
      createErrorMessages([
        {
          field: "id",
          message: `No post found by id: ${id}.`,
        },
      ]),
    );
  }
  res.status(HttpStatus.Ok).send(post);
};
