import { usersQueryRepository } from "../../users/repositories/users.query-repository";
import { bcryptService } from "../adapters/bcrypt.service";

export const authService = {
  async checkLoginAndPassword(str: string, password: string): Promise<boolean> {
    const loginOrEmail: string[] = [str];
    const user = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (user === null) {
      return false;
    }
    return await bcryptService.checkPassword(password, user.password)
  },
};
