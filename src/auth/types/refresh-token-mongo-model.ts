export type RefreshTokenMongoModel = {
  value: string; // Сам токен, который будет храниться в базе данных.
  userId?: string | null; // Идентификатор пользователя, которому принадлежит токен. Может быть null для анонимных токенов.
  deviceId?: string | null | undefined;
  issuedAt: number; // Время выдачи токена в виде timestamp (количество миллисекунд с 1 января 1970 года)
  expiresAt?: number; // Время истечения срока действия токена в виде timestamp
};
