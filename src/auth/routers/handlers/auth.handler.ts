import { Request, Response } from "express";
import { LoginInputModel } from "../../types/login-Input-model";
import { authService } from "../../BLL/auth.service";
import { HttpStatus } from "../../../core/enums/http-status";

export async function authHandler(
  req: Request<{}, {}, LoginInputModel>,
  res: Response,
): Promise<void> {
  const loginOrEmail: string = req.body.loginOrEmail;
  const password: string = req.body.password;
  const result: boolean = await authService.checkLoginAndPassword(
    loginOrEmail,
    password,
  );

  if (!result) {
    res.status(HttpStatus.Unauthorized).send("Login or password is wrong!");
  }
  res.status(HttpStatus.NoContent).send();
}
