import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {videosRepository} from "../../repositories/videos.repository";

export const putVideoHandler = (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    try {
        videosRepository.update(id, req.body);
        res.status(HttpStatus.NoContent);
    } catch (e) {
        res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
    }
}

