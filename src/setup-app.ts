import express, {Express, Request, Response} from "express";
import {HttpStatus} from "./core/enums/http-status";
import {EndpointList} from "./core/constants/endpoint-list";
import {videosRouter} from "./core/videos/routers/videos.router";
import {testingRouter} from "./core/videos/routers/testing.router";
import { setupSwagger } from './core/swagger/setup-swagger';

export const setupApp = (app: Express) => {
    app.use(express.json()); // middleware для парсинга JSON в теле запроса

    // base route
    app.get(EndpointList.SLASH_PATH, (req: Request, res: Response) => {
        res.status(HttpStatus.Ok).send("Welcome to Video Hosting Service API!");
    });

    // routers
    app.use(EndpointList.VIDEOS_PATH, videosRouter);
    app.use(EndpointList.TESTING_PATH, testingRouter);

    setupSwagger(app);
};


