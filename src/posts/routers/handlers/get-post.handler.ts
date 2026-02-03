import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { postsQueryRepository } from "../../repositories/posts.query-repository";

export async function getPostHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    const post = await postsQueryRepository.getPostById(id);
    res.status(HttpStatus.Ok).send(post);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
