import { Request, Response } from "express";
import { UserInputModel } from "../../types/inputTypes/user-input-model";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { UsersService } from "../../BLL/users.service";
import { HttpStatus } from "../../../core/enums/http-status";
import { UsersQueryRepository } from "../../repositories/users.query-repository";
import { iocContainer } from "../../../composition-root";

const usersServiceInstance =
  iocContainer.getInstance<UsersService>(UsersService);

export async function createUserHandler(
  req: Request<{}, {}, UserInputModel>,
  res: Response,
): Promise<void> {
  try {
    const inputData = req.body;
    const createdUserId: string = await usersServiceInstance.create(inputData);

    let createdUser = null;
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts && createdUser === null) {
      attempts++;
      try {
        createdUser = await iocContainer
          .getInstance<UsersQueryRepository>(UsersQueryRepository)
          .getUserById(createdUserId);
      } catch (e) {
        if (attempts === maxAttempts) {
          console.log("2nd attempt to get user by id failed");
          throw e;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    res.status(HttpStatus.Created).send(createdUser);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
