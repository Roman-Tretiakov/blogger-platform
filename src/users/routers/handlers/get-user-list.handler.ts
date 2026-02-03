import { Request, Response } from "express";
import { UserQueryInput } from "../inputTypes/user-query-input";
import { usersQueryRepository } from "../../repositories/users.query-repository";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/utils/sort-and-pagination.utils";
import { HttpStatus } from "../../../core/enums/http-status";

export async function getUserListHandler(
  req: Request<{}, {}, {}, UserQueryInput>,
  res: Response,
): Promise<void> {
  try{
    const sanitizedQuery = matchedData<UserQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });
    const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
    const userList = await usersQueryRepository.getAllUsersWithPagination(queryInput)

    res.status(HttpStatus.Ok).send(userList);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
