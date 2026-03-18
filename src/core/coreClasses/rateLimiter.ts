import { appConfig } from "../config/appConfig";
import { injectable } from "inversify";
import { RateLimiterModel } from "../../rateLimiter/schemas/rate-limiter.schemas";

@injectable()
export class RateLimiter {
  async addDocument(
    ip: string,
    url: string,
    ttlMs: number = appConfig.TTL_INDEX_MONGO_DB_TIME,
  ): Promise<void> {
    const now = new Date();
    const expireAt = new Date(now.getTime() + ttlMs);

    await RateLimiterModel.create({
      ip,
      url,
      date: now,
      expireAt: expireAt,
    });
  }

  async getDocumentsCount(
    ip: string,
    url: string,
    windowMs: number = appConfig.RATE_LIMITER_WINDOW_MS,
  ): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return RateLimiterModel.countDocuments({
      ip,
      url,
      date: { $gte: since },
    });
  }

  async clear(): Promise<void> {
    await RateLimiterModel.deleteMany({});
  }
}
