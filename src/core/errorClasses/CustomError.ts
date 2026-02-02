export class CustomError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.field = field;
    Error.captureStackTrace?.(this, this.constructor);
  }
}