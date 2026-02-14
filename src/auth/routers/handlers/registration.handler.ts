import { Response } from "express";
import { RequestWithBody } from "../../../core/types/request-types";
import { UserInputModel } from "../../../users/types/inputTypes/user-input-model";

export async function registrationHandler(
  req: RequestWithBody<UserInputModel>,
  res: Response,
): Promise<void> {}
