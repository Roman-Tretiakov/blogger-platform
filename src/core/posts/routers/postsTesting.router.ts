import { Router } from "express";
import { EndpointList } from "../../constants/endpoint-list";
import { testingPostsHandler } from "./handlers/testing-posts.handler";

export const postsTestingRouter = Router({});

postsTestingRouter.delete(EndpointList.TEST_DELETE_ALL_VIDEOS, testingPostsHandler);