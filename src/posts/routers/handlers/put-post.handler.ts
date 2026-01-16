import {Request, Response} from 'express';
import {HttpStatus} from "../../../core/enums/http-status";
import {postsRepository} from "../../repositories/posts.repository";

export const putPostHandler = (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        postsRepository.update(id, req.body);
        res.status(HttpStatus.NoContent).send();
    } catch (e) {
        res.status(HttpStatus.NotFound).send();
    }
}

