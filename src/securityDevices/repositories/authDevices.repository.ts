import { authDevicesCollection } from "../../db/mongo.db";
import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";

export const authDevicesRepository = {
  async create(session: AuthDevicesSessions): Promise<void> {
    await authDevicesCollection.insertOne(session);
  },

  // При ротации токенов — обновляем lastActiveDate в существующей записи
  async updateLastActiveDate(deviceId: string): Promise<void> {
    await authDevicesCollection.updateOne(
      { "deviceInfo.deviceId": deviceId },
      { $set: { lastActiveDate: new Date() } },
    );
  },

  async deleteByDeviceId(deviceId: string): Promise<number> {
    const result = await authDevicesCollection.deleteOne({
      "deviceInfo.deviceId": deviceId,
    });
    return result.deletedCount;
  },

  async deleteAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await authDevicesCollection.deleteMany({
      userId,
      "deviceInfo.deviceId": { $ne: currentDeviceId },
    });
  },

  async clear(): Promise<void> {
    await authDevicesCollection.deleteMany({});
  },
};
