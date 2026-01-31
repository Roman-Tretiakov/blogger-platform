import { Request, Response } from "express";
import { UserInputModel } from "../../types/inputTypes/user-input-model";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { usersService } from "../../BLL/users.service";
import { HttpStatus } from "../../../core/enums/http-status";

export async function createUserHandler(
  req: Request<{}, {}, UserInputModel>,
  res: Response,
): Promise<void> {
  try {
    const newUser = await usersService.create(req.body);
    res.status(HttpStatus.Created).send(newUser);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
