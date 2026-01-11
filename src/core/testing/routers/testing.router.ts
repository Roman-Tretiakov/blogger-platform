import {Router} from "express";
import {EndpointList} from "../../constants/endpoint-list";
import { testingHandler } from "./handlers/testing-handler";

export const testingRouter = Router({});

testingRouter.delete(EndpointList.TEST_DELETE_ALL, testingHandler);