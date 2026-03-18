import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";
import { injectable } from "inversify";
import { AuthDeviceModel } from "./schemas/device.schema";

@injectable()
export class AuthDevicesQueryRepository {
  async findByDeviceId(deviceId: string): Promise<AuthDevicesSessions | null> {
    return AuthDeviceModel.findOne({
      "deviceInfo.deviceId": deviceId,
    });
  }

  async findAllByUserId(userId: string): Promise<AuthDevicesSessions[]> {
    return AuthDeviceModel.find({ userId }).lean();
  }
}
