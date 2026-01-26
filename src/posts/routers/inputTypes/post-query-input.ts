import { PaginationAndSortingType } from "../../../core/types/pagination-and-sorting-type";
import { PostSortField } from "./post-sort-field";

export type PostQueryInput = PaginationAndSortingType<PostSortField> &
  Partial<{
    searchNameTerm: string;
  }>;