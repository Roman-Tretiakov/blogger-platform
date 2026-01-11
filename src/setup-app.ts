import express, {Express, Request, Response} from "express";
import {HttpStatus} from "./core/enums/http-status";
import {EndpointList} from "./core/constants/endpoint-list";
import {blogsRouter} from "./core/blogs/routers/blogs.router";
import {testingRouter} from "./core/testing/routers/testing.router";
import { setupSwagger } from './core/swagger/setup-swagger';
import { postsRouter } from "./core/posts/routers/posts.router";

export const setupApp = (app: Express) => {
    app.use(express.json()); // middleware для парсинга JSON в теле запроса

    // base route
    app.get(EndpointList.SLASH_PATH, (req: Request, res: Response) => {
        res.status(HttpStatus.Ok).send("Welcome to Video Hosting Service API!");
    });

    // routers
    app.use(EndpointList.BLOGS_PATH, blogsRouter);
    app.use(EndpointList.POSTS_PATH, postsRouter);
    app.use(EndpointList.TESTING_PATH, testingRouter);

    setupSwagger(app);
};


