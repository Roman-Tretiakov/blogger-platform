import { HttpStatus } from "../enums/http-status";

export function resultCodeToHttpStatusMapper(resultCode: string): HttpStatus {
  switch (resultCode) {
    case "NotFound": return HttpStatus.NotFound;
    case "Unauthorized": return HttpStatus.Unauthorized;
    case "BadRequest": return HttpStatus.BadRequest;
    case "Forbidden": return HttpStatus.Forbidden;
    case "Created": return HttpStatus.Created;
    case "NoContent": return HttpStatus.NoContent;
    case "Ok": return HttpStatus.Ok;
    default: return HttpStatus.InternalServerError;
  }
}