import { AuthDevicesSessions } from "../BLL/types/auth-devices-sessions.interface";
import { injectable } from "inversify";
import { AuthDeviceModel, LeanAuthDevice } from "./schemas/device.schema";

@injectable()
export class AuthDevicesQueryRepository {
  async findByDeviceId(deviceId: string): Promise<LeanAuthDevice | null> {
    return AuthDeviceModel.findOne({
      "deviceInfo.deviceId": deviceId,
    }).lean<LeanAuthDevice>();
  }

  async findAllByUserId(userId: string): Promise<AuthDevicesSessions[]> {
    const sessions = await AuthDeviceModel.find({ userId: userId }).lean();
    return sessions as AuthDevicesSessions[];
  }
}
