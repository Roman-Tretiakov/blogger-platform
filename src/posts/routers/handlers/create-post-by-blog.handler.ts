import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { BlogPostInputModel } from "../../BLL/dto/post-input-dto";
import { postsService } from "../../BLL/posts.service";
import { errorsHandler } from "../../../core/utils/errors-hundler";
import { postsQueryRepository } from "../../repositories/posts.query-repository";

export async function createPostByBlogHandler(
  req: Request<{ id: string }, {}, BlogPostInputModel>,
  res: Response,
): Promise<void> {
  try {
    const blogId = req.params.id;
    const inputData = req.body;
    const createdPostId = await postsService.create(inputData, blogId);

    let createdPost = null;
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts && createdPost === null) {
      attempts++;
      try {
        createdPost = await postsQueryRepository.getPostById(createdPostId);
      } catch (e) {
        if (attempts === maxAttempts) {
          console.log("2nd attempt to get post by id failed");
          throw e;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    res.status(HttpStatus.Created).send(createdPost);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
