import {Request, Response} from "express";
import {HttpStatus} from "../../../enums/http-status";
import {blogsRepository} from "../../repositories/blogs.repository";

export const getBlogListHandler =
(req:Request, res:Response) => {
    res.status(HttpStatus.Ok).send(blogsRepository.findAll());
};