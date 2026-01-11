import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {postsRepository} from "../../repositories/posts.repository";

export const putPostHandler = (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        postsRepository.update(id, req.body);
        res.status(HttpStatus.NoContent);
    } catch (e) {
        res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
    }
}

