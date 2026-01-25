import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { postsService } from "../../BLL/posts.service";

export async function deletePostHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    await postsService.delete(id);
    res
      .status(HttpStatus.NoContent)
      .send(`Post with id: ${id} was deleted successfully.`);
  } catch (e: any) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: "id", message: `${e.message}` }]));
  }
}
