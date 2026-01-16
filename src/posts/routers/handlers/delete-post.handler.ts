import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";

export const deletePostHandler = (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    postsRepository.delete(id);
    res
      .status(HttpStatus.NoContent)
      .send(`Post with id: ${id} was deleted successfully.`);
  } catch (e: any) {
    res.status(HttpStatus.NotFound).send(e.message);
  }
};
