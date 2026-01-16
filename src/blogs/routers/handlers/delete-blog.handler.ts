import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsRepository } from "../../repositories/blogs.repository";

export function deleteBlogHandler(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
        blogsRepository.delete(id);
        res.status(HttpStatus.NoContent).send();
    } catch (e) {
        res.status(HttpStatus.NotFound).send();
    }
}
