import express, {Express, Request, Response} from "express";
import {HttpStatus} from "./core/enums/http-status";
import {EndpointList} from "./core/constants/endpoint-list";
import {blogsRouter} from "./blogs/routers/blogs.router";
import {testingRouter} from "./testing/routers/testing.router";
import { setupSwagger } from './core/swagger/setup-swagger';
import { postsRouter } from "./posts/routers/posts.router";
import { usersRouter } from "./users/routers/usersRouter";
import { authRouter } from "./auth/routers/auth.router";
import { commentsRouter } from "./comments/routers/comments.router";

export const setupApp = (app: Express) => {
    app.use(express.json()); // middleware для парсинга JSON в теле запроса

    // base route
    app.get(EndpointList.SLASH_PATH, (req: Request, res: Response) => {
        res.status(HttpStatus.Ok).send("Welcome to Blogger platform Service API!");
    });

    // routers
    app.use(EndpointList.BLOGS_PATH, blogsRouter);
    app.use(EndpointList.POSTS_PATH, postsRouter);
    app.use(EndpointList.USERS_PATH, usersRouter);
    app.use(EndpointList.AUTH_PATH, authRouter);
    app.use(EndpointList.COMMENTS_PATH, commentsRouter);
    app.use(EndpointList.TESTING_PATH, testingRouter);

    setupSwagger(app);
};


