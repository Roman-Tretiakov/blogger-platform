import { Request, Response } from "express";
import { UserInputModel } from "../../types/inputTypes/user-input-model";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { usersService } from "../../BLL/users.service";
import { HttpStatus } from "../../../core/enums/http-status";
import { usersQueryRepository } from "../../repositories/users.query-repository";

export async function createUserHandler(
  req: Request<{}, {}, UserInputModel>,
  res: Response,
): Promise<void> {
  try {
    const inputData = req.body;
    const createdUserId: string = await usersService.create(inputData);

    let createdUser = null;
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts && createdUser === null) {
      attempts++;
      try {
        createdUser = await usersQueryRepository.getUserById(createdUserId);
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
