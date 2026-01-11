import {Request, Response} from 'express';
import {HttpStatus} from "../../../enums/http-status";
import VideoModel from "../../../types/video-model-type";
import {db} from "../../../../db/db";
import {blogsRepository} from "../../repositories/blogs.repository";

export const postBlogHandler = (req: Request, res: Response) => {
    const newVideo: VideoModel = {
        id: db.videos.length > 0 ? db.videos[db.videos.length - 1].id + 1 : 1,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // current date + 1 day
        ...req.body
    };

    blogsRepository.create(newVideo);
    res.status(HttpStatus.Created).send(newVideo);
}