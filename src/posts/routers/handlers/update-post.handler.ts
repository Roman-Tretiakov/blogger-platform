import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { PostInputModel } from "../../dto/post-input-dto";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { postsService } from "../../BLL/posts.service";
import { NotFoundError } from "../../../core/errorClasses/NotFoundError";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputModel>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
   await postsService.update(id, req.body);
    res.status(HttpStatus.NoContent).send();
  } catch (e: any) {
    const ex = e as NotFoundError;
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: `${ex.field}`, message: `${ex.message}` }]));
  }
}
