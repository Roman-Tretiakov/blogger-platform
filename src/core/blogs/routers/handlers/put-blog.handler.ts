import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {blogsRepository} from "../../repositories/blogs.repository";

export const putBlogHandler = (req: Request, res: Response) => {
    const id: string = req.params.id;
    try {
        blogsRepository.update(id, req.body);
        res.status(HttpStatus.NoContent);
    } catch (e: any) {
        res.status(HttpStatus.NotFound).send(e.message);
    }
}

