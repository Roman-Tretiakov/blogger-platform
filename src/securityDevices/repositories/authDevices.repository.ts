import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";
import { injectable } from "inversify";
import { AuthDeviceModel } from "./schemas/device.schema";

@injectable()
export class AuthDevicesRepository {
  async create(session: AuthDevicesSessions): Promise<void> {
    try {
      await AuthDeviceModel.create(session);
    } catch (error: any) {
      console.error("Failed to create auth device session:", error.message);
    }
  }

  // При ротации токенов — обновляем lastActiveDate в существующей записи и версию токена в БД, а не создаем новую запись
  async updateLastActiveDate(deviceId: string, jti: string): Promise<void> {
    await AuthDeviceModel.updateOne(
      { "deviceInfo.deviceId": deviceId },
      { $set: { lastActiveDate: new Date(), refreshTokenVersion: jti } },
    );
  }

  async deleteByDeviceId(deviceId: string): Promise<number> {
    const result = await AuthDeviceModel.deleteOne({
      "deviceInfo.deviceId": deviceId,
    });
    return result.deletedCount;
  }

  async deleteAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await AuthDeviceModel.deleteMany({
      userId,
      "deviceInfo.deviceId": { $ne: currentDeviceId },
    });
  }

  async clear(): Promise<void> {
    await AuthDeviceModel.deleteMany({});
  }
}
