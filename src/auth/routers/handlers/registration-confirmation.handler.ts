import { Response } from "express";
import { RequestWithBody } from "../../../core/types/request-types";

export async function registrationConfirmationHandler(
  req: RequestWithBody<{ code: string }>,
  res: Response,
): Promise<void> {
  const code: string = req.body.code;
}
