import {Router} from "express";
import {EndpointList} from "../../constants/endpoint-list";
import {HttpStatus} from "../../enums/http-status";
import {db} from "../../../db/db";
import {createErrorMessages} from "../../utils/error.utils";
import VideoModel from "../../types/video-model-type";
import {createVideoInputDtoValidation, updateVideoInputDtoValidation} from "../dto/video-input-dto-validation";

export const videosRouter = Router({});

videosRouter
// videos crud routes:
.get("", (req, res) => {
    res.status(HttpStatus.Ok).send(db.videos);
})

.get(EndpointList.SINGLE_VIDEO, (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(HttpStatus.BadRequest).send(createErrorMessages([{
            field: "id",
            message: `Invalid video id format: ${req.params.id}.`
        }]));
    }
    const id: number = parseInt(req.params.id);
    const video: VideoModel | undefined = db.videos.find((video) => video.id === id);
    if (!video) {
        return res.status(HttpStatus.NotFound).send(createErrorMessages([{
            field: "id",
            message: `No video found by id: ${id}.`
        }]));
    }
    res.status(HttpStatus.Ok).send(video);
})

.post("", (req, res) => {
    // validate request body:
    if (!req.body) {
        return res.status(HttpStatus.BadRequest).send(createErrorMessages([{
            field: "body",
            message: "Request body is missing."
        }]));
    }
    else {
        const errors = createVideoInputDtoValidation(req.body);
        if (errors.length > 0) {
            return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        }

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
    }
})

.put(EndpointList.SINGLE_VIDEO, (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(HttpStatus.BadRequest).send(createErrorMessages([{
            field: "id",
            message: `Invalid video id format: ${req.params.id}.`
        }]));
    }
    // validate request body:
    if (!req.body) {
        return res.status(HttpStatus.BadRequest).send(createErrorMessages([{
            field: "body",
            message: "Request body is missing."
        }]));
    }
    else {
        const errors = updateVideoInputDtoValidation(req.body);
        if (errors.length > 0) {
            return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        }

        const id: number = parseInt(req.params.id);
        const video: VideoModel | undefined = db.videos.find((video) => video.id === id);
        if (!video) {
            return res.status(HttpStatus.NotFound).send(`No video found by id: ${id}.`);
        }
        const newVideo = Object.assign(video, req.body);
        db.videos[id - 1] = newVideo;
        res.status(HttpStatus.Ok).send(newVideo);
    }
})

.delete(EndpointList.SINGLE_VIDEO, (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(HttpStatus.BadRequest).send(createErrorMessages([{
            field: "id",
            message: `Invalid video id format: ${req.params.id}.`
        }]));
    }
    const id: number = parseInt(req.params.id);
    const video: VideoModel | undefined = db.videos.find((video) => video.id === id);
    if (!video) {
        return res.status(HttpStatus.NotFound).send(createErrorMessages([{
            field: "id",
            message: `No video found by id: ${id}.`
        }]));
    }
    db.videos.splice(id - 1, 1);
    res.status(HttpStatus.Ok).send(`Video with id: ${id} was deleted successfully.`);
});