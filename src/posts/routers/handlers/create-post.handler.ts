import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { PostInputModel } from "../../dto/post-input-dto";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { postsService } from "../../BLL/posts.service";
import { PostViewModel } from "../../dto/post-view-model-type";
import { NotFoundError } from "../../../core/errorClasses/NotFoundError";

export async function createPostHandler(
  req: Request<{}, {}, PostInputModel>,
  res: Response,
): Promise<void> {
  try {
    const newPost: PostViewModel = await postsService.create(req.body);
    res.status(HttpStatus.Created).send(newPost);
  } catch (e: any) {
    if (e instanceof NotFoundError) {
      res
        .status(HttpStatus.BadRequest)
        .send(
          createErrorMessages([
            { field: `${e.field}`, message: `${e.message}` },
          ]),
        );
    }
    else{
      res.sendStatus(HttpStatus.InternalServerError);
    }
  }
}
