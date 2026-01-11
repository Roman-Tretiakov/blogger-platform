import {Router} from "express";
import {EndpointList} from "../../constants/endpoint-list";
import { testingBlogsHandler } from "./handlers/testing-blogs-handler";

export const blogsTestingRouter = Router({});

blogsTestingRouter.delete(EndpointList.TEST_DELETE_ALL_VIDEOS, testingBlogsHandler);