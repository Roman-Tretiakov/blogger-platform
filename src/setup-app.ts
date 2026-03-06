import express, { Express, Request, Response } from "express";
import { HttpStatus } from "./core/enums/http-status";
import { EndpointList } from "./core/constants/endpoint-list";
import { blogsRouter } from "./blogs/routers/blogs.router";
import { testingRouter } from "./testing/routers/testing.router";
import { setupSwagger } from "./core/swagger/setup-swagger";
import { postsRouter } from "./posts/routers/posts.router";
import { usersRouter } from "./users/routers/usersRouter";
import { authRouter } from "./auth/routers/auth.router";
import { commentsRouter } from "./comments/routers/comments.router";
import cookieParser from "cookie-parser";
import { globalErrorsHandler } from "./core/middlewares/global-errors.middleware";
import { securityDevicesRouter } from "./securityDevices/routers/security-devices.router";
import session from "express-session";
import { appConfig } from "./core/config/appConfig";
import MongoStore from "connect-mongo";

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса
  app.use(cookieParser()); // middleware для парсинга куки в хедере запроса

  app.use(
    session({
      secret: appConfig.SESSION_SECRET || "default,secret",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: appConfig.MONGO_DB_URL,
        collectionName: "expressSessions",
        ttl: appConfig.TTL_INDEX_EXPRESS_SESSION_TIME,
        autoRemove: "native",
      }),
      name: "sessionId",
      cookie: {
        secure: appConfig.ENVIRONMENT === "production",
        httpOnly: true,
        maxAge: appConfig.RT_TOKEN_TIME + 10000, // миллисекунды
        sameSite: "none",
      },
      rolling: true,
    }),
  );
  app.get(EndpointList.SLASH_PATH, (req: Request, res: Response) => {
    res.status(HttpStatus.Ok).send("Welcome to Blogger platform Service API!");
  });

  // routers
  app.use(EndpointList.BLOGS_PATH, blogsRouter);
  app.use(EndpointList.POSTS_PATH, postsRouter);
  app.use(EndpointList.USERS_PATH, usersRouter);
  app.use(EndpointList.AUTH_PATH, authRouter);
  app.use(EndpointList.COMMENTS_PATH, commentsRouter);
  app.use(EndpointList.SECURITY_DEVICES_PATH, securityDevicesRouter);
  app.use(EndpointList.TESTING_PATH, testingRouter);

  setupSwagger(app);

  app.use(globalErrorsHandler);
};
