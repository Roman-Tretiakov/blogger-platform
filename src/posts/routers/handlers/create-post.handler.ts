import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import {
  BlogPostInputModel,
  PostInputModel,
} from "../../BLL/dto/post-input-dto";
import { postsService } from "../../BLL/posts.service";
import { PostViewModel } from "../../BLL/dto/post-view-model-type";
import { errorsHandler } from "../../../core/utils/errors-hundler";

export async function createPostHandler(
  req: Request<{}, {}, PostInputModel>,
  res: Response,
): Promise<void> {
  try {
    const newPost: PostViewModel = await postsService.create(req.body);
    res.status(HttpStatus.Created).send(newPost);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}

export async function createPostByBlogHandler(
  req: Request<{blogId: string}, {}, BlogPostInputModel>,
  res: Response,
): Promise<void> {
  try {
    const blogId = req.params.blogId;
    const newPost: PostViewModel = await postsService.create(req.body, blogId);
    res.status(HttpStatus.Created).send(newPost);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
