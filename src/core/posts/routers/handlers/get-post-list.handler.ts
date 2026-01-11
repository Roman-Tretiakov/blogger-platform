import {Request, Response} from "express";
import {HttpStatus} from "../../../enums/http-status";
import {videosRepository} from "../../repositories/videos.repository";

export const getPostListHandler =
(req:Request, res:Response) => {
    res.status(HttpStatus.Ok).send(videosRepository.findAll());
};