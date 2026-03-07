import { ObjectId } from "mongodb";

export interface AuthDevicesSessions {
  _id?: ObjectId;
  userId: string;
  deviceInfo: {
    deviceId: string;
    title: string;
    ip: string | null;
  };
  issuedAt: Date;
  expireAt: Date;
  lastActiveDate: Date;
}
