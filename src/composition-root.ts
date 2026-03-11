import "reflect-metadata";
//import { Container } from "inversify";
import { UsersRepository } from "./users/repositories/users.repository";
import { UsersQueryRepository } from "./users/repositories/users.query-repository";
import { usersCollection } from "./db/mongo.db";
import { UsersService } from "./users/BLL/users.service";
import { BcryptService } from "./auth/adapters/bcrypt.service";

// export const container = new Container();
//
// container.bind(UsersRepository).to(UsersRepository);
// container.bind(UsersQueryRepository).to(UsersQueryRepository);
// container.bind(UsersService).to(UsersService);

//===== самописный ioc контейнер =====

const instances: any[] = [];

const usersRepository = new UsersRepository(usersCollection);
instances.push(usersRepository);

const usersQueryRepository = new UsersQueryRepository(usersCollection);
instances.push(usersQueryRepository);

const bcryptService = new BcryptService();
instances.push(bcryptService);

const usersService = new UsersService(
  usersRepository,
  usersQueryRepository,
  bcryptService,
);
instances.push(usersService);

export const iocContainer = {
  getInstance<T>(ClassType: any): T {
    return instances.find((inst) => inst instanceof ClassType);
  },
};

const instance = iocContainer.getInstance<UsersService>(UsersService);
