import { PostsRepository } from "../../posts/repositories/posts.repository";
import { BlogsRepository } from "../../blogs/repositories/blogs.repository";
import { UsersRepository } from "../../users/repositories/users.repository";
import { CommentsRepository } from "../../comments/repositories/comments.repository";
import { AuthDevicesRepository } from "../../securityDevices/repositories/authDevices.repository";

export class TestingController {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
    private authDevicesRepository: AuthDevicesRepository,
  ) {}

  async clearAllData() {
    await this.postsRepository.clear();
    await this.blogsRepository.clear();
    await this.usersRepository.clear();
    await this.commentsRepository.clear();
    await this.authDevicesRepository.clear();
  }
}
