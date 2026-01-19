import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { WithId } from "mongodb";
import { PostMongoModel } from "../../dto/post-mongo-model";
import { createErrorMessages } from "../../../core/utils/error.utils";

export async function getPostHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    const post: WithId<PostMongoModel> | null =
      await postsRepository.findById(id);
    if (!post) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: "id", message: "Post not found" }]),
        );
      return;
    }
    res.status(HttpStatus.Ok).send(post);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
