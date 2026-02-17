import { UserInputModel } from "../types/inputTypes/user-input-model";
import { usersRepository } from "../repositories/users.repository";
import { bcryptService } from "../../auth/adapters/bcrypt.service";
import { CustomError } from "../../core/errorClasses/CustomError";
import { DeleteResult } from "mongodb";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { usersQueryRepository } from "../repositories/users.query-repository";
import { HttpStatus } from "../../core/enums/http-status";
import { User } from "./user-entity";

export const usersService = {
  async create(inputData: UserInputModel): Promise<string> {
    const { login, password, email } = inputData;

    const existedLoginOrEmail = await usersQueryRepository.findByLoginOrEmail([
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

    const passwordHash = await bcryptService.generateHash(password);
    const newUser = new User(
      login,
      email,
      passwordHash,
      new Date().toISOString(),
    );

    return await usersRepository.create(newUser);
  },

  async deleteById(id: string): Promise<void> {
    const result: DeleteResult = await usersRepository.delete(id);

    if (result.deletedCount < 1) {
      throw new NotFoundError(`User with id ${id} not found`, "id");
    }
  },

  async clear(): Promise<void> {
    await usersRepository.clear();
  },
};
