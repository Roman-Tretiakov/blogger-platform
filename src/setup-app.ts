import express, {Express, Request, Response} from "express";
import {HttpStatus} from "./core/enums/http-status";
import {EndpointList} from "./core/constants/endpoint-list";
import {blogsRouter} from "./core/videos/routers/blogs.router";
import {blogsTestingRouter} from "./core/videos/routers/blogsTesting.router";
import { setupSwagger } from './core/swagger/setup-swagger';
import { postsRouter } from "./core/posts/routers/posts.router";
import { postsTestingRouter } from "./core/posts/routers/postsTesting.router";

export const setupApp = (app: Express) => {
    app.use(express.json()); // middleware для парсинга JSON в теле запроса

    // base route
    app.get(EndpointList.SLASH_PATH, (req: Request, res: Response) => {
        res.status(HttpStatus.Ok).send("Welcome to Video Hosting Service API!");
    });

    // routers
    app.use(EndpointList.BLOGS_PATH, blogsRouter);
    app.use(EndpointList.BLOGS_TESTING_PATH, blogsTestingRouter);
    app.use(EndpointList.POSTS_PATH, postsRouter);
    app.use(EndpointList.POSTS_TESTING_PATH, postsTestingRouter);

    setupSwagger(app);
};


