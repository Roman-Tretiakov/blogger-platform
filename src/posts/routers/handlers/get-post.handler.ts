import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { postsService } from "../../BLL/posts.service";

export async function getPostHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    const post = await postsService.findById(id);
    res.status(HttpStatus.Ok).send(post);
  } catch (e: any) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: "id", message: `${e.message}` }]));
  }
}
