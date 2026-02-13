import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../../core/enums/http-status';

export const USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';

export const superAdminGuard = (
  req: Request<{}, any, any, any>,
  res: Response,
  next: NextFunction
) => {
    const auth = req.headers['authorization'] as string; // 'Basic xxxx'
    if (!auth) {
        res.sendStatus(HttpStatus.Unauthorized);
        return;
    }

    const [authType, token] = auth.split(' ');
    if (authType.trim() !== 'Basic') {
        res.sendStatus(HttpStatus.Unauthorized);
        return;
    }

    const credentials = Buffer.from(token.trim(), "base64").toString("utf-8");
    const [username, password] = credentials.split(':');

    if (username !== USERNAME || password !== PASSWORD) {
        res.sendStatus(HttpStatus.Unauthorized);
        return;
    }

    next(); // Успешная авторизация, продолжаем
}