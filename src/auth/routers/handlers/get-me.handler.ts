import { Response } from "express";
import { IdType } from "../../../core/types/id-type";
import { RequestWithUserId } from "../../../core/types/request-types";
import { HttpStatus } from "../../../core/enums/http-status";
import { usersQueryRepository } from "../../../users/repositories/users.query-repository";

export async function getLoggedUserHandler(
  req: RequestWithUserId<IdType>,
  res: Response,
): Promise<void> {
  const userId = req.userData!.userId;

  if (!userId) {
    res.status(HttpStatus.Unauthorized).send("Request not contains userId");
    return;
  }
  const me = await usersQueryRepository.getMe(userId);
  res.status(HttpStatus.Ok).send(me);
}
