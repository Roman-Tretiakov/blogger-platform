import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { blogsService } from "../../BLL/blogs.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { BlogQueryInput } from "../inputTypes/blog-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/utils/sort-and-pagination.utils";

export async function getBlogListHandler (
  req: Request<{}, {}, {}, BlogQueryInput>,
  res: Response
): Promise<void> {
  try {
    const sanitizedQuery = matchedData<BlogQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });
    const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
    const blogList = await blogsService.findMany(queryInput);

    res.status(HttpStatus.Ok).send(blogList);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}