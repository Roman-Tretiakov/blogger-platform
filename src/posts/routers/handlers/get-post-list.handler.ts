import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsService } from "../../BLL/posts.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { PostQueryInput } from "../inputTypes/post-query-input";

export async function getPostListHandler(
  req: Request<{}, {}, {}, PostQueryInput>,
  res: Response
): Promise<void> {
  try {
    const queryInput = req.query;
    const postList = await postsService.findMany(queryInput);

    res.status(HttpStatus.Ok).send(postList);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}