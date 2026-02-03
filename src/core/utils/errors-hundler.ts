import { Response } from "express";
import { NotFoundError } from "../errorClasses/NotFoundError";
import { DomainError } from "../errorClasses/DomainError";
import { HttpStatus } from "../enums/http-status";
import { createErrorMessages } from "./error.utils";
import { CustomError } from "../errorClasses/CustomError";

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof NotFoundError) {
    res
      .status(HttpStatus.NotFound)
      .send(
        createErrorMessages([
          { field: `${error.field}`, message: `${error.message}` },
        ]),
      );
    return;
  }

  if (error instanceof CustomError) {
    res
      .status(error.statusCode)
      .send(
        createErrorMessages([
          { field: `${error.field}`, message: `${error.message}` },
        ]),
      );
    return;
  }

  if (error instanceof DomainError) {
    return;
  }
}
