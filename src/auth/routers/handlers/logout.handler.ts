import { Request, Response } from "express";

export async function logoutHandler(
  req: Request,
  res: Response,
): Promise<void> {
  //TODO: удалить refreshToken из БД и удалить куки
}
