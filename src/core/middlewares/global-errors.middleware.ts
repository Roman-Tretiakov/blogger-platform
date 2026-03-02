import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errorClasses/NotFoundError";
import { HttpStatus } from "../enums/http-status";

export const globalErrorsHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Global error handler caught:", err);

  if (err instanceof NotFoundError) {
    res.status(HttpStatus.Unauthorized).send(`User not found: ${err}`);
    return;
  }
  console.error("Unhandled error:", err);
  res
    .status(HttpStatus.InternalServerError)
    .send(`Internal server error: ${err}`);
};
