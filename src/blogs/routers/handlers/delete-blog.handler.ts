import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { createErrorMessages } from "../../../core/utils/error.utils";

export async function deleteBlogHandler(req: Request, res: Response) {
  const id: string = req.params.id;
  try {
    await blogsService.delete(id);
    res
      .status(HttpStatus.NoContent)
      .send(`Blog with id: ${id} was deleted successfully.`);
  } catch (e: any) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: "id", message: `${e.message}` }]));
  }
}