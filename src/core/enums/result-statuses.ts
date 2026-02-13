export enum ResultStatus {
  Success = "Successfully processed",
  Failure = "Failure processed",
  NotFound = "Data not found",
  Unauthorized = "Incorrect credentials or access token",
  BadRequest = "Incorrect data",
  Forbidden = "Not enough permissions",
  Created = "Data successfully created",
  NoContent = "Successfully processed, but no content to return",
}