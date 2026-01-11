import { Request, Response } from "express";
import { postsRepository } from "../../repositories/posts.repository";
import { HttpStatus } from "../../../enums/http-status";

export const testingPostsHandler =
  (req:Request, res:Response) => {
    postsRepository.clear();
    res.status(HttpStatus.NoContent).send(postsRepository.findAll());
  };