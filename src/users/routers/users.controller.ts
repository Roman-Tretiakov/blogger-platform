import { UsersService } from "../BLL/users.service";
import { UsersQueryRepository } from "../repositories/users.query-repository";
import { Request, Response } from "express";
import { UserQueryInput } from "./inputTypes/user-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../core/utils/sort-and-pagination.utils";
import { HttpStatus } from "../../core/enums/http-status";
import { errorsHandler } from "../../core/utils/errors-hundler";
import { UserInputModel } from "../types/inputTypes/user-input-model";

export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async getList(
    req: Request<{}, {}, {}, UserQueryInput>,
    res: Response,
  ): Promise<void> {
    try {
      const sanitizedQuery = matchedData<UserQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });
      const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
      const userList =
        await this.usersQueryRepository.getAllUsersWithPagination(queryInput);

      res.status(HttpStatus.Ok).send(userList);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async create(
    req: Request<{}, {}, UserInputModel>,
    res: Response,
  ): Promise<void> {
    try {
      const inputData = req.body;
      const createdUserId: string = await this.usersService.create(inputData);
      const createdUser =
        await this.usersQueryRepository.getUserById(createdUserId);

      res.status(HttpStatus.Created).send(createdUser);
    } catch (e: unknown) {
      errorsHandler(e, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.usersService.deleteById(req.params.id);
      res.status(HttpStatus.NoContent).send();
    } catch (e) {
      errorsHandler(e, res);
    }
  }
}
