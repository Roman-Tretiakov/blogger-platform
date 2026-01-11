import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import {createErrorMessages} from "../../../utils/error.utils";
import {blogsRepository} from "../../repositories/blogs.repository";
import videoModelType from "../../../types/video-model-type";

export const getBlogHandler = (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    const video: videoModelType | null = blogsRepository.findById(id);
    if (!video) {
        return res.status(HttpStatus.NotFound).send(createErrorMessages([{
            field: "id",
            message: `No video found by id: ${id}.`
        }]));
    }
    res.status(HttpStatus.Ok).send(video);
};