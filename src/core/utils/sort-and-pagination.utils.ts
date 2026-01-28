import { PaginationAndSortingType } from "../types/pagination-and-sorting-type";
import { paginationAndSortingDefault } from "../middlewares/pagination-sorting-validation.middleware";

export function setDefaultSortAndPaginationIfNotExist<P = string>(
  query: Partial<PaginationAndSortingType<P>>,
): PaginationAndSortingType<P> {
   return {
     ...query,
     pageNumber: query.pageNumber ?? paginationAndSortingDefault.pageNumber,
     pageSize: query.pageSize ?? paginationAndSortingDefault.pageSize,
     sortDirection: query.sortDirection ?? paginationAndSortingDefault.sortDirection,
     sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
   };
}
