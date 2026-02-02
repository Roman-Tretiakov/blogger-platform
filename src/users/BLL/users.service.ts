import { UserInputModel } from "../types/inputTypes/user-input-model";
import { usersRepository } from "../repositories/users.repository";
import { bcryptService } from "../../auth/adapters/bcrypt.service";
import { CustomError } from "../../core/errorClasses/CustomError";
import { DeleteResult } from "mongodb";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { usersQueryRepository } from "../repositories/users.query-repository";

export const usersService = {
  async create(inputData: UserInputModel): Promise<string> {
    const existedLoginOrEmail = await usersQueryRepository.findByLoginOrEmail([
      inputData.login,
      inputData.email,
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
      throw new CustomError(message, field);
    }

    const passwordHash = await bcryptService.generateHash(inputData.password);

    return await usersRepository.create({
      ...inputData,
      password: passwordHash,
      createdAt: new Date().toISOString(),
    });
  },

  async deleteById(id: string):Promise<void> {
    const result: DeleteResult = await usersRepository.delete(id);

    if(result.deletedCount < 1) {
      throw new NotFoundError(`User with id ${id} not found`, "id");
    }
  }
};
