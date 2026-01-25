import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsService } from "../../BLL/posts.service";

export async function getPostListHandler(req: Request, res: Response) {
  try {
    const posts = await postsService.findAll();
    res.status(HttpStatus.Ok).send(posts);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
