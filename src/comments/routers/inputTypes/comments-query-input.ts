import { PaginationAndSortingType } from "../../../core/types/pagination-and-sorting-type";
import { CommentsSortFields } from "./comments-sort-fields";

export type CommentsQueryInput = PaginationAndSortingType<CommentsSortFields>;