import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { usersService } from "../../BLL/users.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function deleteUserHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const id: string = req.params.id;
  try {
    await usersService.deleteById(id);
    res
      .status(HttpStatus.NoContent)
      .send(`User with id: ${id} was deleted successfully.`);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
