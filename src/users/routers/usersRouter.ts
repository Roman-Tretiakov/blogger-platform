import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { UserSortFields } from "./inputTypes/UserSortFields";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";

export const usersRouter = Router({});

usersRouter.get(
  EndpointList.USERS_PATH,
  paginationAndSortingValidation(UserSortFields),
  inputValidationResultMiddleware,

);
