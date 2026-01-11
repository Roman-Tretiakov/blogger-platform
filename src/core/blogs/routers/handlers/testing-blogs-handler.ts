import { Request, Response } from "express";
import { HttpStatus } from "../../../enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";

export const testingBlogsHandler =
  (req:Request, res:Response) => {
    blogsRepository.clear();
    res.status(HttpStatus.NoContent).send(blogsRepository.findAll());
  };