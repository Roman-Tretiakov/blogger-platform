import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";
import { injectable } from "inversify";
import { authDevicesCollection } from "../../db/mongo.db";

@injectable()
export class AuthDevicesQueryRepository {
  async findByDeviceId(deviceId: string): Promise<AuthDevicesSessions | null> {
    return authDevicesCollection.findOne({
      "deviceInfo.deviceId": deviceId,
    });
  }

  async findAllByUserId(userId: string): Promise<AuthDevicesSessions[]> {
    return authDevicesCollection.find({ userId }).toArray();
  }
}
