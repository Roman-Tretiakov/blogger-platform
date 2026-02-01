import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { PostQueryInput } from "../inputTypes/post-query-input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/utils/sort-and-pagination.utils";
import { postsQueryRepository } from "../../repositories/posts.query-repository";

export async function getPostListHandler(
  req: Request<{}, {}, {}, PostQueryInput>,
  res: Response,
): Promise<void> {
  try {
    const sanitizedQuery = matchedData<PostQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });
    const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
    const postList = await postsQueryRepository.findMany(queryInput);

    res.status(HttpStatus.Ok).send(postList);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}