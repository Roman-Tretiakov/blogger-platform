import {SortDirection} from "../enums/sort-direction";

export type PaginationAndSortingType<P> = {
  pageNumber: number;
  pageSize: number;
  sortBy: P;
  sortDirection: SortDirection;
};