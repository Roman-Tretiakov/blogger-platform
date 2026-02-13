import { HttpStatus } from "../enums/http-status";

export function resultStatusToHttpStatusMapper(resultStatus: string): HttpStatus {
  switch (resultStatus) {
    case "Data not found":
      return HttpStatus.NotFound;
    case "Incorrect credentials or access token":
      return HttpStatus.Unauthorized;
    case "Incorrect data":
      return HttpStatus.BadRequest;
    case "Not enough permissions":
      return HttpStatus.Forbidden;
    case "Successfully created":
      return HttpStatus.Created;
    case "Successfully processed, but no content to return":
      return HttpStatus.NoContent;
    case "Successfully processed":
      return HttpStatus.Ok;
    default:
      return HttpStatus.InternalServerError;
  }
}