import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostInputModel } from "../../dto/post-input-dto";
import { mapToPostMongoModel } from "../mappers/map-to-post-mongo-model";
import { WithId } from "mongodb";
import { PostMongoModel } from "../../dto/post-mongo-model";
import { mapToPostViewModel } from "../mappers/map-to-post-view-model";

export async function createPostHandler(
  req: Request<{}, {}, PostInputModel>,
  res: Response,
): Promise<void> {
  try {
    const newPost: WithId<PostMongoModel> = await postsRepository.create(
      mapToPostMongoModel(req.body));
    res.status(HttpStatus.Created).send(mapToPostViewModel(newPost));
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
