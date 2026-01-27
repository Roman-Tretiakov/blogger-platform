import {SortDirection} from "../enums/sort-direction";

export type PaginationAndSortingType<P> = {
  searchNameTerm?: string;
  pageNumber: number;
  pageSize: number;
  sortBy: P;
  sortDirection: SortDirection;
};