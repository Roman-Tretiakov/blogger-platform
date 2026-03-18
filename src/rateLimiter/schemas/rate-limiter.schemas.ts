import mongoose, { Schema, Document } from "mongoose";

export interface IRateLimiter extends Document {
  ip: string;
  url: string;
  date: Date;
  expireAt: Date;
}

const RateLimiterSchema = new Schema<IRateLimiter>({
  ip: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: Date, required: true },
  expireAt: { type: Date, required: true },
});

RateLimiterSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
console.log("✅ TTL index created on ratelimits collection");

export const RateLimiterModel = mongoose.model<IRateLimiter>(
  "RateLimit",
  RateLimiterSchema,
);
