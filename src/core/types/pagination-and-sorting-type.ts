import {SortDirection} from "../enums/sort-direction";

export type PaginationAndSortingType<P> = {
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  pageNumber: number;
  pageSize: number;
  sortBy: P;
  sortDirection: SortDirection;
};