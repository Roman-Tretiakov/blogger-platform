import { Request, Response } from "express";
import { PostsRepository } from "../../posts/repositories/posts.repository";
import { BlogsRepository } from "../../blogs/repositories/blogs.repository";
import { UsersRepository } from "../../users/repositories/users.repository";
import { CommentsRepository } from "../../comments/repositories/comments.repository";
import { AuthDevicesRepository } from "../../securityDevices/repositories/authDevices.repository";
import { HttpStatus } from "../../core/enums/http-status";
import { inject, injectable } from "inversify";
import { RateLimiter } from "../../core/coreClasses/rateLimiter";

@injectable()
export class TestingController {
  constructor(
    @inject(PostsRepository)
    private postsRepository: PostsRepository,
    @inject(BlogsRepository)
    private blogsRepository: BlogsRepository,
    @inject(UsersRepository)
    private usersRepository: UsersRepository,
    @inject(CommentsRepository)
    private commentsRepository: CommentsRepository,
    @inject(AuthDevicesRepository)
    private authDevicesRepository: AuthDevicesRepository,
    @inject(RateLimiter)
    private rateLimiter: RateLimiter,
  ) {}

  async clearAllData(req: Request, res: Response): Promise<void> {
    await this.postsRepository.clear();
    await this.blogsRepository.clear();
    await this.usersRepository.clear();
    await this.commentsRepository.clear();
    await this.authDevicesRepository.clear();
    await this.rateLimiter.clear();

    res.status(HttpStatus.NoContent).send("All data deleted");
  }
}
