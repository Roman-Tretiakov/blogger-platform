import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { iocContainer } from "../../composition-root";
import { TestingController } from "./testing.controller";

const testingController = iocContainer.resolve(TestingController);
export const testingRouter = Router({});

testingRouter.delete(
  EndpointList.TEST_DELETE_ALL,
  testingController.clearAllData.bind(testingController),
);
