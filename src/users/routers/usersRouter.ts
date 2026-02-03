import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { UserSortFields } from "./inputTypes/user-sort-fields";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createUsersBodyValidation } from "../middlewares/create-users-body-validation.middleware";
import { createUserHandler } from "./handlers/create-users.handler";
import { getUserListHandler } from "./handlers/get-user-list.handler";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { deleteUserHandler } from "./handlers/delete-users.handler";

export const usersRouter = Router({});

usersRouter
  .get(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    paginationAndSortingValidation(UserSortFields),
    inputValidationResultMiddleware,
    getUserListHandler,
  )
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuardMiddleware,
    createUsersBodyValidation,
    inputValidationResultMiddleware,
    createUserHandler,
  )
  .delete(
    EndpointList.BY_ID,
    superAdminGuardMiddleware,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    deleteUserHandler,
  )
