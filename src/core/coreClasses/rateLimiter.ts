import { Collection } from "mongodb";
import { appConfig } from "../config/appConfig";

export interface RateLimiterDocument {
  ip: string;
  url: string;
  date: Date;
  expiresAt: Date;
}

export class RateLimiter {
  constructor(private collection: Collection<RateLimiterDocument>) {
    this.collection = collection;
  }

  async addDocument(
    ip: string,
    url: string,
    ttlMs: number = appConfig.TTL_INDEX_MONGO_DB_TIME,
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    await this.collection.insertOne({
      ip,
      url,
      date: now,
      expiresAt,
    });
  }

  async getDocumentsCount(
    ip: string,
    url: string,
    windowMs: number = appConfig.RATE_LIMITER_WINDOW_MS,
  ): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return this.collection.countDocuments({
      ip,
      url,
      date: { $gte: since },
    });
  }
}
