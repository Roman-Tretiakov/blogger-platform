import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsService } from "../../BLL/posts.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function getPostHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    const post = await postsService.findById(id);
    res.status(HttpStatus.Ok).send(post);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
