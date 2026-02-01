import { UserInputModel } from "../types/inputTypes/user-input-model";
import { UserViewModel } from "../types/outputTypes/user-view-model";
import { usersRepository } from "../repositories/users.repository";
import { bcryptService } from "../../auth/adapters/bcrypt.service";
import { BadReqError } from "../../core/errorClasses/BadReqError";
import { mapToUserViewModel } from "../mappers/map-to-user-view-model";
import { DeleteResult } from "mongodb";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";

export const usersService = {
  async create(inputData: UserInputModel): Promise<UserViewModel> {
    const existedLoginOrEmail = await usersRepository.findByLoginOrEmail([
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
      throw new BadReqError(message, field);
    }

    const passwordHash = await bcryptService.generateHash(inputData.password);

    const newUser = await usersRepository.create({
      ...inputData,
      password: passwordHash,
      createdAt: new Date().toISOString(),
    });
    return mapToUserViewModel(newUser);
  },

  async deleteById(id: string):Promise<void> {
    const result: DeleteResult = await usersRepository.delete(id);

    if(result.deletedCount < 1) {
      throw new NotFoundError(`User with id ${id} not found`, "id");
    }
  }
};
