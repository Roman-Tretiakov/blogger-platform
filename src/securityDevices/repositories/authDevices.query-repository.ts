import { authDevicesCollection } from "../../db/mongo.db";
import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";

export const authDevicesQueryRepository = {
  async findByDeviceId(deviceId: string): Promise<AuthDevicesSessions | null> {
    return authDevicesCollection.findOne({ "deviceInfo.deviceId": deviceId });
  },

  async findAllByUserId(userId: string): Promise<AuthDevicesSessions[]> {
    return authDevicesCollection.find({ userId }).toArray();
  },
};
