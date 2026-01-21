import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { BlogInputModel } from "../../dto/blog-input-dto";
import { WithId } from "mongodb";
import { BlogMongoModel } from "../../dto/blog-mongo-model";

export async function updateBlogHandler (
  req: Request<{ id: string }, {}, BlogInputModel>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    const blog: WithId<BlogMongoModel> | null =
      await blogsRepository.findById(id);
    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: "id", message: "Blog not found" }]),
        );
      return;
    }
    const updatedBlog: BlogMongoModel = {
      ...blog,
      ...req.body
    }

    await blogsRepository.update(id, updatedBlog);
    res.status(HttpStatus.NoContent).send();
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
