import {Request, Response} from "express";
import {HttpStatus} from "../../../core/enums/http-status";
import {postsRepository} from "../../repositories/posts.repository";

export const getPostListHandler = async (req:Request, res:Response) => {
  const posts = await postsRepository.findAll();
    res.status(HttpStatus.Ok).send(posts);
};