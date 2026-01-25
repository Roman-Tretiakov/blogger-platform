import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsService } from "../../BLL/posts.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function deletePostHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    await postsService.delete(id);
    res
      .status(HttpStatus.NoContent)
      .send(`Post with id: ${id} was deleted successfully.`);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
