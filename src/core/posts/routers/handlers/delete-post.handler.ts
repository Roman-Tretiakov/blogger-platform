import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { createErrorMessages } from "../../../utils/error.utils";

export const deletePostHandler = (req: Request, res: Response) => {
  const id: string = req.params.id;
  try {
    postsRepository.delete(id);
    res
      .status(HttpStatus.NoContent)
      .send(`Post with id: ${id} was deleted successfully.`);
  } catch (e: any) {
    res.status(HttpStatus.NotFound).send(
      createErrorMessages([
        {
          field: "blogId",
          message: e.message,
        },
      ]),
    );
  }
};
