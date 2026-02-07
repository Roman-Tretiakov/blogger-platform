import { IdType } from "./id-type";

declare global {
  namespace Express {
    interface Request {
      userId: IdType | null;
    }
  }
}