import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostInputModel } from "../../dto/post-input-dto";
import { mapToPostMongoModel } from "../mappers/map-to-post-mongo-model";
import { WithId } from "mongodb";
import { PostMongoModel } from "../../dto/post-mongo-model";
import { mapToPostViewModel } from "../mappers/map-to-post-view-model";
import { BlogMongoModel } from "../../../blogs/dto/blog-mongo-model";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { createErrorMessages } from "../../../core/utils/error.utils";

export async function createPostHandler(
  req: Request<{}, {}, PostInputModel>,
  res: Response,
): Promise<void> {
  try {
    const blog: WithId<BlogMongoModel> | null = await blogsRepository.findById(
      req.body.blogId,
    );
    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([
            { field: "blogId", message: "Blog for the post not found" },
          ]),
        );
      return;
    }

    const newPost: WithId<PostMongoModel> = await postsRepository.create(
      mapToPostMongoModel(req.body, blog),
    );
    res.status(HttpStatus.Created).send(mapToPostViewModel(newPost));
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
