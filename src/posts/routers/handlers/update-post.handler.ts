import { Request, Response } from "express";
import { HttpStatus } from "../../../core/enums/http-status";
import { postsRepository } from "../../repositories/posts.repository";
import { PostInputModel } from "../../dto/post-input-dto";
import { WithId } from "mongodb";
import { createErrorMessages } from "../../../core/utils/error.utils";
import { PostMongoModel } from "../../dto/post-mongo-model";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { BlogMongoModel } from "../../../blogs/dto/blog-mongo-model";

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputModel>,
  res: Response,
) {
  const id: string = req.params.id;
  try {
    const post: WithId<PostMongoModel> | null =
      await postsRepository.findById(id);
    if (!post) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: "id", message: "Post not found" }]),
        );
      return;
    }

    const blog: WithId<BlogMongoModel> | null = await blogsRepository.findById(req.body.blogId);
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
    const updatedPost = {
      ...post,
      ...req.body,
      blogName: blog.name,
    }

    await postsRepository.update(id, updatedPost);
    res.status(HttpStatus.NoContent).send();
  } catch (e: unknown) {
    res.status(HttpStatus.NotFound).send();
  }
}
