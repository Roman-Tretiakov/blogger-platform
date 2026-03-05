import { Response } from "express";
import { RequestWithUserData } from "../../../core/types/request-types";
import { IdType } from "../../../core/types/id-type";

export async function getSessionListHandler(
  req: RequestWithUserData<IdType>,
  res: Response,
): Promise<void> {}
