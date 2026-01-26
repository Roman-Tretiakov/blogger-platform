import { PaginationAndSortingType } from "../types/pagination-and-sorting-type";
import { paginationAndSortingDefault } from "../middlewares/pagination-sorting-validation.middleware";

export function setDefaultSortAndPaginationIfNotExist<P = string>(
  query: Partial<PaginationAndSortingType<P>>,
): PaginationAndSortingType<P> {
  return {
    ...paginationAndSortingDefault,
    ...query,
    sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
  };
}
