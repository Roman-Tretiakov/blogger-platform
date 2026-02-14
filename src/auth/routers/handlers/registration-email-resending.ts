import { Response } from "express";
import { RequestWithBody } from "../../../core/types/request-types";

export async function registrationEmailResending(
  req: RequestWithBody<{ email: string }>,
  res: Response,
): Promise<void> {}
