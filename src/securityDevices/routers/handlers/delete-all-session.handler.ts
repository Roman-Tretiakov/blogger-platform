import { Response } from "express";
import { RequestWithQueryAndUserData } from "../../../core/types/request-types";
import { IdType } from "../../../core/types/id-type";

export async function deleteAllSessionsExceptCurrentHandler(
  req: RequestWithQueryAndUserData<{ deviceId: string }, IdType>,
  res: Response,
): Promise<void> {}
