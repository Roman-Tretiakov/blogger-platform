import { HttpStatus } from "../enums/http-status";

export class CustomError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly statusCode: HttpStatus,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.field = field;
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
