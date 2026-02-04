import { ResultStatus } from "../enums/result-statuses";
import { ExtensionType } from "./extension-type";

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions: ExtensionType[];
  data: T;
};