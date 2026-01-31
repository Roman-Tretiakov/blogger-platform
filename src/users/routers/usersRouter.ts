import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { UserSortFields } from "./inputTypes/user-sort-fields";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createUsersBodyValidation } from "../middlewares/create-users-body-validation.middleware";
import { createUserHandler } from "./handlers/create-users.handler";

export const usersRouter = Router({});

usersRouter
  .get(
    EndpointList.USERS_PATH,
    paginationAndSortingValidation(UserSortFields),
    inputValidationResultMiddleware,
  )
  .post(
    EndpointList.USERS_PATH,
    createUsersBodyValidation,
    inputValidationResultMiddleware,
    createUserHandler,
  );
