import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { WithId } from "mongodb";
import { BlogMongoModel } from "../../dto/blog-mongo-model";
import { BlogViewModel } from "../../../core/types/blog-view-model-type";

export async function getBlogListHandler (req: Request, res: Response): Promise<void> {
  try {
    const response: WithId<BlogMongoModel>[] = await blogsRepository.findAll();
    const blogs: BlogViewModel[] = response.map(mapToBlogViewModel);
    res.status(HttpStatus.Ok).send(blogs);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
