import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsService } from "../../BLL/posts.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function getPostListHandler(req: Request, res: Response) {
  try {
    const posts = await postsService.findAll();
    res.status(HttpStatus.Ok).send(posts);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
