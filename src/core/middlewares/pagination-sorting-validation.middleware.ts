import { query } from "express-validator";
import { SortDirection } from "../enums/sort-direction";
import { ErrorNames } from "../enums/error-names";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;

export function paginationAndSortingValidation<T extends string>(
  sortByEnum: Record<string, T>,
) {
  return [
    query("pageNumber")
      .default(DEFAULT_PAGE)
      .isInt({ min: 1 })
      .withMessage(ErrorNames.PAGE_NUMBER_TYPE_ERROR)
      .toInt()
      .customSanitizer((value) => Math.floor(value)),

    query("pageSize")
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage(ErrorNames.PAGE_SIZE_ERROR)
      .toInt()
      .customSanitizer((value) => Math.floor(value)),

    query("sortBy")
      .default(Object.values(sortByEnum)[0])
      .isIn(Object.values(sortByEnum))
      .withMessage(
        `${ErrorNames.SORT_BY_TYPE_ERROR}${Object.values(sortByEnum).join(", ")}`,
      ),

    query("sortDirection")
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(Object.values(SortDirection))
      .withMessage(`${ErrorNames.SORT_DIRECTION_TYPE_ERROR}${Object.values(SortDirection).join(', ')}`),
  ];
}
