import { DBName } from "./db-collection-names";
import * as mongoose from "mongoose";
import { RateLimiterModel } from "../rateLimiter/schemas/rate-limiter.schemas";
import { AuthDeviceModel } from "../securityDevices/repositories/schemas/device.schema";
import { CommentReactionModel } from "../commentReaction/schema/comment-reaction.schema";

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  try {
    await mongoose.connect(url, { dbName: DBName });
    console.log(`✅ Connected to the database ${DBName}`);

    await Promise.all([
      RateLimiterModel.syncIndexes(),
      AuthDeviceModel.syncIndexes(),
      CommentReactionModel.syncIndexes(),
    ]);
    console.log("✅ Indexes synchronized");
  } catch (e) {
    await mongoose.disconnect();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

export async function closeDBConnection(): Promise<void> {
  await mongoose.disconnect();
}
