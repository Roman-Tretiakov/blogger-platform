import { Router } from "express";
import { EndpointList } from "../../core/constants/endpoint-list";
import { paginationAndSortingValidation } from "../../core/middlewares/pagination-sorting-validation.middleware";
import { UserSortFields } from "./inputTypes/user-sort-fields";
import { inputValidationResultMiddleware } from "../../core/middlewares/input-validation-result.middleware";
import { createUsersBodyValidation } from "../middlewares/create-users-body-validation.middleware";
import { superAdminGuard } from "../../auth/middlewares/guards/super-admin.guard";
import { paramIdValidationMiddleware } from "../../core/middlewares/params-id-validation.middleware";
import { iocContainer } from "../../composition-root";
import { UsersController } from "./users.controller";

const usersController = iocContainer.resolve(UsersController);
export const usersRouter = Router({});

usersRouter
  .get(
    EndpointList.EMPTY_PATH,
    superAdminGuard,
    paginationAndSortingValidation(UserSortFields),
    inputValidationResultMiddleware,
    usersController.getList.bind(usersController),
  )
  .post(
    EndpointList.EMPTY_PATH,
    superAdminGuard,
    createUsersBodyValidation,
    inputValidationResultMiddleware,
    usersController.create.bind(usersController),
  )
  .delete(
    EndpointList.BY_ID,
    superAdminGuard,
    paramIdValidationMiddleware,
    inputValidationResultMiddleware,
    usersController.delete.bind(usersController),
  );
