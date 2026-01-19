import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { BlogViewModel } from "../../../core/types/blog-view-model-type";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { WithId } from "mongodb";
import { BlogMongoModel } from "../../dto/blog-mongo-model";

export async function getBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    const response: WithId<BlogMongoModel> | null = await blogsRepository.findById(id);
    if (!response) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([
            { field: "id", message: `No blog found by id: ${id}.` },
          ]),
        );
    }
    const blog: BlogViewModel = mapToBlogViewModel(response);
    res.status(HttpStatus.Ok).send(blog);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
