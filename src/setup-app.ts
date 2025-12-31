import express, {Express, Request, Response} from "express";
import {db} from "./db/db";
import VideoModel from "./core/types/video-model-type";
import {UpdateVideoInputModel} from "./core/videos/dto/video-input-dto";
import {HttpStatus} from "./core/enums/http-status";
import {RouterList} from "./core/constants/router-list";

export const setupApp = (app: Express) => {
    app.use(express.json()); // middleware для парсинга JSON в теле запроса

    // base route
    app.get(RouterList.SLASH_ROUTE, (req: Request, res: Response) => {
        res.status(HttpStatus.Ok).send("Welcome to Video Hosting Service API!");
    });

    // videos crud routes
    app.get(RouterList.ALL_VIDEOS, (req: Request, res: Response) => {
        res.status(HttpStatus.Ok).send(db.videos);
    });

    app.get(RouterList.SINGLE_VIDEO, (req: Request, res: Response) => {
        if (isNaN(parseInt(req.params.id))) {
            return res.status(HttpStatus.BadRequest).send(`Invalid video id format: ${req.params.id}.`);
        }
        const id: number = parseInt(req.params.id);
        const video: VideoModel | undefined = db.videos.find((video) => video.id === id);
        if (!video) {
            return res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
        }
        res.status(HttpStatus.Ok).send(video);
    });

    app.post(RouterList.ALL_VIDEOS, (req: Request, res: Response) => {
        // validate request body to be added
        const newVideo: VideoModel = {
            id: db.videos.length > 0 ? db.videos[db.videos.length - 1].id + 1 : 1,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // current date + 1 day
            ...req.body
        };
        db.videos.push(newVideo);
        res.status(HttpStatus.Created).send(newVideo);
    });

    app.put(RouterList.SINGLE_VIDEO, (req: Request, res: Response) => {
        if (isNaN(parseInt(req.params.id))) {
            return res.status(HttpStatus.BadRequest).send(`Invalid video id format: ${req.params.id}.`);
        }
        // validate request body to be updated

        const id: number = parseInt(req.params.id);
        const video: VideoModel | undefined = db.videos.find((video) => video.id === id);
        if (!video) {
            return res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
        }
        const newVideo = Object.assign(video, req.body);
        db.videos[id - 1] = newVideo;
        res.status(HttpStatus.Ok).send(newVideo);
    });

    app.delete(RouterList.SINGLE_VIDEO, (req: Request, res: Response) => {
        if (isNaN(parseInt(req.params.id))) {
            return res.status(HttpStatus.BadRequest).send(`Invalid video id format: ${req.params.id}.`);
        }
        const id: number = parseInt(req.params.id);
        const video: VideoModel | undefined = db.videos.find((video) => video.id === id);
        if (!video) {
            return res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
        }
        db.videos.splice(id - 1, 1);
        res.status(HttpStatus.Ok).send(`Video with id: ${id} was deleted successfully.`);
    });

    app.delete(RouterList.TEST_DELETE_ALL_VIDEOS, (req: Request, res: Response) => {
        db.videos = [];
        res.status(HttpStatus.NoContent).send(db.videos);
    });
};


