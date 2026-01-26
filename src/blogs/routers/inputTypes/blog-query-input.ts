import { PaginationAndSortingType } from "../../../core/types/pagination-and-sorting-type";
import { BlogSortField } from "./blog-sort-field";

export type BlogQueryInput = PaginationAndSortingType<BlogSortField> &
  Partial<{
    searchNameTerm: string;
  }>;