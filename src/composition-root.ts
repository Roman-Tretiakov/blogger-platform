import "reflect-metadata";
import { Container } from "inversify";
import { UsersRepository } from "./users/repositories/users.repository";
import { UsersQueryRepository } from "./users/repositories/users.query-repository";
import { UsersService } from "./users/BLL/users.service";
import { BcryptService } from "./auth/adapters/bcrypt.service";
import { UsersController } from "./users/routers/users.controller";
import { NodemailerService } from "./auth/adapters/emailSendler/nodemailer.service";
import { AuthDevicesRepository } from "./securityDevices/repositories/authDevices.repository";
import { AuthService } from "./auth/BLL/auth.service";
import { AuthController } from "./auth/routers/auth.controller";
import { AuthDevicesQueryRepository } from "./securityDevices/repositories/authDevices.query-repository";
import { BlogsQueryRepository } from "./blogs/repositories/blogs.query-repository";
import { BlogsRepository } from "./blogs/repositories/blogs.repository";
import { BlogsService } from "./blogs/BLL/blogs.service";
import { CommentsRepository } from "./comments/repositories/comments.repository";
import { CommentsQueryRepository } from "./comments/repositories/comments.query-repository";
import { CommentsService } from "./comments/BLL/comments.service";
import { BlogsController } from "./blogs/routers/blogs.controller";
import { CommentsController } from "./comments/routers/comments.controller";
import { PostsRepository } from "./posts/repositories/posts.repository";
import { PostsQueryRepository } from "./posts/repositories/posts.query-repository";
import { PostsService } from "./posts/BLL/posts.service";
import { PostsController } from "./posts/routers/posts.controller";
import { SecurityDevicesController } from "./securityDevices/routers/security-devices.controller";
import { TestingController } from "./testing/routers/testing.controller";
import { JwtService } from "./auth/adapters/jwt.service";
import { RateLimiter } from "./core/coreClasses/rateLimiter";
import { emailServiceToken } from "./auth/adapters/emailSendler/email-service.token";
import { CommentReactionRepository } from "./commentReaction/repositories/comment-reaction.repository";
import { CommentReactionQueryRepository } from "./commentReaction/repositories/comment-reaction.query-repository";

export const iocContainer = new Container();

iocContainer
  .bind<IEmailService>(emailServiceToken)
  .to(NodemailerService)
  .inSingletonScope();
iocContainer.bind(JwtService).to(JwtService).inSingletonScope();
iocContainer.bind(BcryptService).to(BcryptService).inSingletonScope();

iocContainer
  .bind(AuthDevicesRepository)
  .to(AuthDevicesRepository)
  .inSingletonScope();
iocContainer
  .bind(AuthDevicesQueryRepository)
  .to(AuthDevicesQueryRepository)
  .inSingletonScope();
iocContainer
  .bind(SecurityDevicesController)
  .to(SecurityDevicesController)
  .inSingletonScope();

iocContainer.bind(AuthService).to(AuthService).inSingletonScope();
iocContainer.bind(AuthController).to(AuthController).inSingletonScope();

iocContainer.bind(UsersRepository).to(UsersRepository).inSingletonScope();
iocContainer
  .bind(UsersQueryRepository)
  .to(UsersQueryRepository)
  .inSingletonScope();
iocContainer.bind(UsersService).to(UsersService).inSingletonScope();
iocContainer.bind(UsersController).to(UsersController).inSingletonScope();

iocContainer
  .bind(BlogsQueryRepository)
  .to(BlogsQueryRepository)
  .inSingletonScope();
iocContainer.bind(BlogsRepository).to(BlogsRepository).inSingletonScope();
iocContainer.bind(BlogsService).to(BlogsService).inSingletonScope();
iocContainer.bind(BlogsController).to(BlogsController).inSingletonScope();

iocContainer.bind(CommentsRepository).to(CommentsRepository).inSingletonScope();
iocContainer
  .bind(CommentsQueryRepository)
  .to(CommentsQueryRepository)
  .inSingletonScope();
iocContainer.bind(CommentsService).to(CommentsService).inSingletonScope();
iocContainer.bind(CommentsController).to(CommentsController).inSingletonScope();

iocContainer
  .bind(CommentReactionRepository)
  .to(CommentReactionRepository)
  .inSingletonScope();

iocContainer
  .bind(CommentReactionQueryRepository)
  .to(CommentReactionQueryRepository)
  .inSingletonScope();

iocContainer.bind(PostsRepository).to(PostsRepository).inSingletonScope();
iocContainer
  .bind(PostsQueryRepository)
  .to(PostsQueryRepository)
  .inSingletonScope();
iocContainer.bind(PostsService).to(PostsService).inSingletonScope();
iocContainer.bind(PostsController).to(PostsController).inSingletonScope();

iocContainer.bind(TestingController).to(TestingController).inSingletonScope();
iocContainer.bind(RateLimiter).to(RateLimiter).inSingletonScope();
