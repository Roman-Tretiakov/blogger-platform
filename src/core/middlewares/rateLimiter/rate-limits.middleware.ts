import { Request, Response, NextFunction } from "express";
import { RateLimiter } from "../../coreClasses/rateLimiter";
import { rateLimitsCollection } from "../../../db/mongo.db";
import { appConfig } from "../../config/appConfig";
import { HttpStatus } from "../../enums/http-status";

const rateLimiter = new RateLimiter(rateLimitsCollection);

export const rateLimitsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip!;
  const url = req.originalUrl;
  const maxRequests = appConfig.RATE_LIMIT_MAX_REQUESTS;

  try {
    await rateLimiter.addDocument(ip, url);
    const rateCount = await rateLimiter.getDocumentsCount(ip, url);

    if (rateCount > maxRequests) {
      return res.status(429).send("Too many requests");
    }

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - rateCount),
    );

    next();
  } catch (error: unknown) {
    return res.status(HttpStatus.InternalServerError).send(`message: ${error}`);
  }
};
