import {Request, Response} from "express";
import {HttpStatus} from "../../../enums/http-status";
import {videosRepository} from "../../repositories/posts.repository";

export const getPostListHandler =
(req:Request, res:Response) => {
    res.status(HttpStatus.Ok).send(videosRepository.findAll());
};