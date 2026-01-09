import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {videosRepository} from "../../repositories/videos.repository";

export function deleteVideoHandler(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    try {
        videosRepository.delete(id);
        res.status(HttpStatus.NoContent).send(`Video with id: ${id} was deleted successfully.`);
    } catch (e) {
        res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
    }
}