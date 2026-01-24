import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { WithId } from "mongodb";
import { PostMongoModel } from "../../dto/post-mongo-model";
import { PostViewModel } from "../../domainType/post-view-model-type";
import { mapToPostViewModel } from "../mappers/map-to-post-view-model";

export async function getPostListHandler(req: Request, res: Response) {
  try {
    const response: WithId<PostMongoModel>[] = await postsRepository.findAll();
    const posts: PostViewModel[] = response.map(mapToPostViewModel);
    res.status(HttpStatus.Ok).send(posts);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
