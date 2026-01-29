import { query } from "express-validator";
import { SortDirection } from "../enums/sort-direction";
import { ErrorNames } from "../enums/error-names";
import { PaginationAndSortingType } from "../types/pagination-and-sorting-type";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;
const DEFAULT_SORT_BY = "createdAt";

export const paginationAndSortingDefault: PaginationAndSortingType<string> = {
  pageNumber: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: DEFAULT_SORT_BY,
  sortDirection: DEFAULT_SORT_DIRECTION,
};

export function paginationAndSortingValidation<T extends string>(
  sortByEnum: Record<string, T>,
) {
  const allowedSortFields = Object.values(sortByEnum);
  const allowedSortDirection = Object.values(SortDirection);
  return [
    query("pageNumber")
      .optional({ values: "falsy" }) //чтобы default() применялся и для ''
      .default(DEFAULT_PAGE)
      .isInt({ min: 1 })
      .withMessage(ErrorNames.PAGE_NUMBER_TYPE_ERROR)
      .toInt()
      .customSanitizer((value) => Math.floor(value)),

    query("pageSize")
      .optional({ values: "falsy" })
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage(ErrorNames.PAGE_SIZE_ERROR)
      .toInt()
      .customSanitizer((value) => Math.floor(value)),

    query("sortBy")
      .optional({ values: "falsy" })
      .default(allowedSortFields[0])
      .isIn(allowedSortFields)
      .withMessage(
        `${ErrorNames.SORT_BY_TYPE_ERROR}${allowedSortFields.join(", ")}`,
      ),

    query("sortDirection")
      .optional({ values: "falsy" })
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(allowedSortDirection)
      .withMessage(
        `${ErrorNames.SORT_DIRECTION_TYPE_ERROR}${allowedSortDirection.join(", ")}`,
      ),

    query("searchNameTerm").optional().trim(),

    query("searchLoginTerm").optional({ values: "falsy" }).trim().default(null),

    query("searchEmailTerm").optional({values: "falsy"}).default(null),
  ];
}
