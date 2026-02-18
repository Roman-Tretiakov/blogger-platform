import { randomUUID } from "crypto";
import { add } from "date-fns/add";
import { usersRepository } from "../../src/users/repositories/users.repository";

type RegisterUserPayloadType = {
  login: string;
  pass: string;
  email: string;
  code?: string;
  expirationDate?: string;
  isConfirmed?: boolean;
};

export type RegisterUserResultType = {
  id: string;
  login: string;
  email: string;
  password: string;
  createdAt: string;
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};

export const testSeeder = {
  createUserDto() {
    return {
      login: "testing",
      email: "test@gmail.com",
      pass: "123456789",
    };
  },
  createUserDtos(count: number) {
    const users = [];

    for (let i = 0; i <= count; i++) {
      users.push({
        login: "test" + i,
        email: `test${i}@gmail.com`,
        pass: "12345678",
      });
    }
    return users;
  },
  async insertUser({
    login,
    pass,
    email,
    code,
    expirationDate,
    isConfirmed,
  }: RegisterUserPayloadType): Promise<RegisterUserResultType> {
    const newUser = {
      login,
      email,
      password: pass,
      createdAt: new Date().toISOString(),
      confirmationCode: code ?? randomUUID(),
      expirationDate:
        expirationDate ??
        add(new Date(), {
          minutes: 30,
        }).toISOString(),
      isConfirmed: isConfirmed ?? false,
    };
    const res = await usersRepository.create(newUser);
    return {
      id: res,
      ...newUser,
    };
  },
};
