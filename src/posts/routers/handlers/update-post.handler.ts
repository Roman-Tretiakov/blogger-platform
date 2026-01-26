import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { PostInputModel } from "../../BLL/dto/post-input-dto";
import { postsService } from "../../BLL/posts.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputModel>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    await postsService.update(id, req.body);
    res.status(HttpStatus.NoContent).send();
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
