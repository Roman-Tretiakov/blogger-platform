import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { UsersService } from "../../BLL/users.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { iocContainer } from "../../../composition-root";

export async function deleteUserHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const id: string = req.params.id;
  try {
    await iocContainer.getInstance(UsersService).deleteById(id);
    res
      .status(HttpStatus.NoContent)
      .send(`User with id: ${id} was deleted successfully.`);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
