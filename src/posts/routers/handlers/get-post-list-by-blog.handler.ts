import { Request, Response } from "express";
import { PostQueryInput } from "../inputTypes/post-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/utils/sort-and-pagination.utils";
import { postsService } from "../../BLL/posts.service";
import { HttpStatus } from "../../../core/enums/http-status";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function getPostListByBlogHandler(
  req: Request<{id: string}, {}, {}, PostQueryInput>,
  res: Response,
): Promise<void> {
  try {
    const blogId: string = req.params.id;
    const sanitizedQuery = matchedData<PostQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });
    const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
    const postList = await postsService.findMany(queryInput, blogId);

    res.status(HttpStatus.Ok).send(postList);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}