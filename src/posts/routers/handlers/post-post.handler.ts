import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostViewModel } from "../../../core/types/post-view-model-type";
import { PostInputModel } from "../../dto/post-input-dto";
import { createErrorMessages } from "../../../core/utils/error.utils";

export const postPostHandler = async (req: Request, res: Response) => {
  try {
    const newPost: PostViewModel = await postsRepository.create(
      req.body as PostInputModel,
    );
    res.status(HttpStatus.Created).send(newPost);
  } catch (e: any) {
    res.status(HttpStatus.NotFound).send(
      createErrorMessages([
        {
          message: e.message,
          field: "blogId",
        },
      ]),
    );
  }
};
