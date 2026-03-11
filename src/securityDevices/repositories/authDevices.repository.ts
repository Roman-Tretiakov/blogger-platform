import { Collection } from "mongodb";
import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";

export class AuthDevicesRepository {
  constructor(private authDevicesCollection: Collection<AuthDevicesSessions>) {}

  async create(session: AuthDevicesSessions): Promise<void> {
    try {
      await this.authDevicesCollection.insertOne(session);
    } catch (error: any) {
      console.error("Failed to create auth device session:", error.message);
    }
  }

  // При ротации токенов — обновляем lastActiveDate в существующей записи и версию токена в БД, а не создаем новую запись
  async updateLastActiveDate(deviceId: string, iat: number): Promise<void> {
    await this.authDevicesCollection.updateOne(
      { "deviceInfo.deviceId": deviceId },
      { $set: { lastActiveDate: new Date(), refreshTokenVersion: iat } },
    );
  }

  async deleteByDeviceId(deviceId: string): Promise<number> {
    const result = await this.authDevicesCollection.deleteOne({
      "deviceInfo.deviceId": deviceId,
    });
    return result.deletedCount;
  }

  async deleteAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await this.authDevicesCollection.deleteMany({
      userId,
      "deviceInfo.deviceId": { $ne: currentDeviceId },
    });
  }

  async clear(): Promise<void> {
    await this.authDevicesCollection.deleteMany({});
  }
}
