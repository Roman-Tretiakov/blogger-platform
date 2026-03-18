import { DBName } from "./db-collection-names";
import * as mongoose from "mongoose";

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  try {
    const db_name = { dbName: DBName };
    await mongoose.connect(url, db_name);
    await mongoose.connection.db!.command({ ping: 1 });
    console.log(`✅ Connected to the database ${db_name}`);
  } catch (e) {
    await mongoose.disconnect();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

export async function closeDBConnection(): Promise<void> {
  await mongoose.disconnect();
}
