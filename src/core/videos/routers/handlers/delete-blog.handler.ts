import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {blogsRepository} from "../../repositories/blogs.repository";

export function deleteBlogHandler(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    try {
        blogsRepository.delete(id);
        res.status(HttpStatus.NoContent).send(`Video with id: ${id} was deleted successfully.`);
    } catch (e) {
        res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
    }
}