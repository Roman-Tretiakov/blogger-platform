import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";
import { Collection } from "mongodb";

export class AuthDevicesQueryRepository {
  constructor(private authDevicesCollection: Collection<AuthDevicesSessions>) {}

  async findByDeviceId(deviceId: string): Promise<AuthDevicesSessions | null> {
    return this.authDevicesCollection.findOne({
      "deviceInfo.deviceId": deviceId,
    });
  }

  async findAllByUserId(userId: string): Promise<AuthDevicesSessions[]> {
    return this.authDevicesCollection.find({ userId }).toArray();
  }
}
