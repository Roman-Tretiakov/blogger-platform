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

export const iocContainer = new Container();

iocContainer.bind(NodemailerService).to(NodemailerService);
iocContainer.bind(JwtService).to(JwtService);
iocContainer.bind(BcryptService).to(BcryptService);

iocContainer.bind(AuthDevicesRepository).to(AuthDevicesRepository);
iocContainer.bind(AuthDevicesQueryRepository).to(AuthDevicesQueryRepository);
iocContainer.bind(SecurityDevicesController).to(SecurityDevicesController);

iocContainer.bind(AuthService).to(AuthService);
iocContainer.bind(AuthController).to(AuthController);

iocContainer.bind(UsersRepository).to(UsersRepository);
iocContainer.bind(UsersQueryRepository).to(UsersQueryRepository);
iocContainer.bind(UsersService).to(UsersService);
iocContainer.bind(UsersController).to(UsersController);

iocContainer.bind(BlogsQueryRepository).to(BlogsQueryRepository);
iocContainer.bind(BlogsRepository).to(BlogsRepository);
iocContainer.bind(BlogsService).to(BlogsService);
iocContainer.bind(BlogsController).to(BlogsController);

iocContainer.bind(CommentsRepository).to(CommentsRepository);
iocContainer.bind(CommentsQueryRepository).to(CommentsQueryRepository);
iocContainer.bind(CommentsService).to(CommentsService);
iocContainer.bind(CommentsController).to(CommentsController);

iocContainer.bind(PostsRepository).to(PostsRepository);
iocContainer.bind(PostsQueryRepository).to(PostsQueryRepository);
iocContainer.bind(PostsService).to(PostsService);
iocContainer.bind(PostsController).to(PostsController);

iocContainer.bind(TestingController).to(TestingController);

//===== самописный ioc контейнер =====

// const instances: any[] = [];
//
// const nodemailerService = new NodemailerService();
// instances.push(nodemailerService);
//
// const authDevicesRepository = new AuthDevicesRepository(authDevicesCollection);
// instances.push(authDevicesRepository);
//
// const usersRepository = new UsersRepository(usersCollection);
// instances.push(usersRepository);
//
// const usersQueryRepository = new UsersQueryRepository(usersCollection);
// instances.push(usersQueryRepository);
//
// const bcryptService = new BcryptService();
// instances.push(bcryptService);
//
// const usersService = new UsersService(
//   usersRepository,
//   usersQueryRepository,
//   bcryptService,
// );
// instances.push(usersService);
//
// const usersController = new UsersController(usersService, usersQueryRepository);
// instances.push(usersController);
//
// export const iocContainer = {
//   getInstance<T>(ClassType: any): T {
//     return instances.find((inst) => inst instanceof ClassType);
//   },
// };
