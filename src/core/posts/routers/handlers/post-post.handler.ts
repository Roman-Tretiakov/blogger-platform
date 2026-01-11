import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostViewModel } from "../../../types/post-model-type";
import { PostInputModel } from "../../dto/post-input-dto";
import { createErrorMessages } from "../../../utils/error.utils";

export const postPostHandler = (req: Request, res: Response) => {
  try {
    const newPost: PostViewModel | any = postsRepository.create(
      req.body as PostInputModel,
    );
    res.status(HttpStatus.Created).send(newPost);
  } catch (e: any) {
    res.status(HttpStatus.NotFound).send(
      createErrorMessages([
        {
          field: "blogId",
          message: e.message,
        },
      ]),
    );
  }
};