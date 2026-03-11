import { NextFunction, Response } from "express";
import { IdType } from "../../../core/types/id-type";
import { RequestWithUserData } from "../../../core/types/request-types";
import { HttpStatus } from "../../../core/enums/http-status";
import { UsersQueryRepository } from "../../../users/repositories/users.query-repository";

export async function getLoggedUserHandler(
  req: RequestWithUserData<IdType>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.userData!.userId;

  if (!userId) {
    res.status(HttpStatus.Unauthorized).send("Request not contains userId");
    return;
  }

  try {
    const me = await UsersQueryRepository.getMe(userId);
    res.status(HttpStatus.Ok).send(me);
  } catch (e) {
    next(e);
  }
}
