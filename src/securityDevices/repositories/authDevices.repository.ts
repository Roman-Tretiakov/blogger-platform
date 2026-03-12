import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";
import { injectable } from "inversify";
import { authDevicesCollection } from "../../db/mongo.db";

@injectable()
export class AuthDevicesRepository {
  async create(session: AuthDevicesSessions): Promise<void> {
    try {
      await authDevicesCollection.insertOne(session);
    } catch (error: any) {
      console.error("Failed to create auth device session:", error.message);
    }
  }

  // При ротации токенов — обновляем lastActiveDate в существующей записи и версию токена в БД, а не создаем новую запись
  async updateLastActiveDate(deviceId: string, iat: number): Promise<void> {
    await authDevicesCollection.updateOne(
      { "deviceInfo.deviceId": deviceId },
      { $set: { lastActiveDate: new Date(), refreshTokenVersion: iat } },
    );
  }

  async deleteByDeviceId(deviceId: string): Promise<number> {
    const result = await authDevicesCollection.deleteOne({
      "deviceInfo.deviceId": deviceId,
    });
    return result.deletedCount;
  }

  async deleteAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await authDevicesCollection.deleteMany({
      userId,
      "deviceInfo.deviceId": { $ne: currentDeviceId },
    });
  }

  async clear(): Promise<void> {
    await authDevicesCollection.deleteMany({});
  }
}
