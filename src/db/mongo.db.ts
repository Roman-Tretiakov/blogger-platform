import { DBName } from "./db-collection-names";
import * as mongoose from "mongoose";
import { RateLimiterModel } from "../rateLimiter/schemas/rate-limiter.schemas";
import { AuthDeviceModel } from "../securityDevices/repositories/schemas/device.schema";

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  try {
    const db_name = { dbName: DBName };
    await mongoose.connect(url, db_name);
    await mongoose.connection.db!.command({ ping: 1 });
    console.log(`✅ Connected to the database ${DBName}`);

    await Promise.all([
      RateLimiterModel.syncIndexes(),
      AuthDeviceModel.syncIndexes(),
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
