import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {blogsRepository} from "../../repositories/blogs.repository";

export const putBlogHandler = (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    try {
        blogsRepository.update(id, req.body);
        res.status(HttpStatus.NoContent);
    } catch (e) {
        res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
    }
}

