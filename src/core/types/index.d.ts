import { IdType } from "./id-type";

declare global {
  namespace Express {
    interface Request {
      userData: IdType | null;
    }
  }
}
