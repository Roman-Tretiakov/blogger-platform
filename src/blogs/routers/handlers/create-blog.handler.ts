import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { BlogMongoModel } from "../../dto/blog-mongo-model";
import { BlogInputModel } from "../../dto/blog-input-dto";
import { WithId } from "mongodb";
import { mapToBlogMongoModel } from "../mappers/map-to-blog-mongo-model";

export async function createBlogHandler (
  req: Request<{}, {}, BlogInputModel>,
  res: Response): Promise<void> {
  try {
    const newBlog: WithId<BlogMongoModel> = await blogsRepository.create(mapToBlogMongoModel(req.body));
    res.status(HttpStatus.Created).send(mapToBlogViewModel(newBlog));
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
