import { UserInputModel } from "../types/inputTypes/user-input-model";
import { UsersRepository } from "../repositories/users.repository";
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { CustomError } from "../../core/errorClasses/CustomError";
import { DeleteResult } from "mongodb";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { UsersQueryRepository } from "../repositories/users.query-repository";
import { HttpStatus } from "../../core/enums/http-status";
import { User } from "./user-entity";

export class UsersService {
  constructor(
    private repository: UsersRepository,
    private queryRepository: UsersQueryRepository,
    private cryptoService: BcryptService,
  ) {}

  async create(inputData: UserInputModel): Promise<string> {
    const { login, password, email } = inputData;

    const existedLoginOrEmail = await this.queryRepository.findByLoginOrEmail([
      login,
      email,
    ]);
    if (existedLoginOrEmail) {
      let message, field: string;
      if (inputData.login === existedLoginOrEmail.login) {
        field = "login";
        message = `User already exists with the same ${field}`;
      } else {
        field = "email";
        message = `User already exists with the same ${field}`;
      }
      throw new CustomError(message, field, HttpStatus.BadRequest);
    }

    const passwordHash = await this.cryptoService.generateHash(password);
    const newUser = new User(
      login,
      email,
      passwordHash,
      new Date().toISOString(),
    );

    return await this.repository.create(newUser);
  }

  async deleteById(id: string): Promise<void> {
    const result: DeleteResult = await this.repository.delete(id);

    if (result.deletedCount < 1) {
      throw new NotFoundError(`User with id ${id} not found`, "id");
    }
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}
